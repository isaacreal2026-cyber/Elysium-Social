/**
 * Elysium Push Notification Service
 *
 * Wraps expo-notifications for cross-platform push notifications.
 * Handles: permission request, token registration, local & remote
 * notification scheduling, and deep-link routing.
 *
 * This module is a NEW file — it does not alter any existing code.
 * Screens import this service to register for notifications and
 * react to incoming pushes.
 *
 * Usage (in _layout.tsx or any screen):
 *   import { NotificationService } from "@/services/notifications";
 *   useEffect(() => { NotificationService.init(); }, []);
 */

import { Platform } from "react-native";

// ── Types ──────────────────────────────────────────────────────

export type NotificationChannel =
  | "resonance"
  | "comment"
  | "follow"
  | "voice_live"
  | "hub_invite"
  | "mention"
  | "story_view"
  | "dm";

export interface ElysiumNotificationPayload {
  channel: NotificationChannel;
  actorId: string;
  postId?: string;
  hubId?: string;
  voiceRoomId?: string;
  threadId?: string;
  body: string;
  createdAt: number;
}

export interface NotificationPreferences {
  enabled: boolean;
  channels: Record<NotificationChannel, boolean>;
  quietHoursStart: number; // 0-23 hour
  quietHoursEnd: number;   // 0-23 hour
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  enabled: true,
  channels: {
    resonance: true,
    comment: true,
    follow: true,
    voice_live: true,
    hub_invite: true,
    mention: true,
    story_view: false,
    dm: true,
  },
  quietHoursStart: 23,
  quietHoursEnd: 7,
  soundEnabled: true,
  vibrationEnabled: true,
};

// ── Deep link routes ───────────────────────────────────────────

export function notificationToDeepLink(payload: ElysiumNotificationPayload): string | null {
  switch (payload.channel) {
    case "resonance":
    case "comment":
    case "mention":
      return payload.postId ? `/post/${payload.postId}` : null;
    case "follow":
      return `/profile/${payload.actorId}`;
    case "voice_live":
      return payload.voiceRoomId ? `/voice-party?roomId=${payload.voiceRoomId}` : "/voice-party";
    case "hub_invite":
      return payload.hubId ? `/hub/${payload.hubId}` : null;
    case "story_view":
      return null; // story views are informational only
    case "dm":
      return payload.threadId ? `/messages/${payload.threadId}` : null;
    default:
      return null;
  }
}

// ── Service class ──────────────────────────────────────────────

class NotificationServiceImpl {
  private pushToken: string | null = null;
  private prefs: NotificationPreferences = DEFAULT_NOTIFICATION_PREFS;
  private initialized = false;
  private listeners: Array<(payload: ElysiumNotificationPayload) => void> = [];

  /**
   * Initialize the notification service.
   * On native: requests permissions, registers for push, sets up channels.
   * On web: falls back to the Notification API.
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    if (Platform.OS === "web") {
      // Web Notification API
      if (typeof Notification !== "undefined" && Notification.permission === "default") {
        await Notification.requestPermission();
      }
      this.initialized = true;
      return;
    }

    try {
      // Dynamic import to avoid bundling on web where expo-notifications doesn't exist
      const notifications = await import("expo-notifications");
      const { requestPermissionsAsync, getExpoPushTokenAsync, setNotificationChannelAsync, AndroidImportance } = notifications as any;

      const { status } = await requestPermissionsAsync();
      if (status !== "granted") {
        console.warn("[ElysiumNotifications] Permission not granted");
        this.initialized = true;
        return;
      }

      // Android notification channels
      if (Platform.OS === "android") {
        await setNotificationChannelAsync("elysium-default", {
          name: "Elysium",
          importance: AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#B57BFF",
        });
        await setNotificationChannelAsync("elysium-voice", {
          name: "Voice Rooms",
          importance: AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#5EEAD4",
          sound: "default",
        });
      }

      // Get push token
      const tokenData = await getExpoPushTokenAsync({ projectId: "elysium-social" });
      this.pushToken = tokenData.data;
      console.log("[ElysiumNotifications] Push token:", this.pushToken);
    } catch (e) {
      console.warn("[ElysiumNotifications] Init failed (expo-notifications not available):", (e as Error).message);
    }

    this.initialized = true;
  }

  /** Get the current push token (null if not registered) */
  getPushToken(): string | null {
    return this.pushToken;
  }

  /** Check if notifications are currently in quiet hours */
  isInQuietHours(): boolean {
    const hour = new Date().getHours();
    const { quietHoursStart, quietHoursEnd } = this.prefs;
    if (quietHoursStart <= quietHoursEnd) {
      return hour >= quietHoursStart && hour < quietHoursEnd;
    }
    // Wraps midnight
    return hour >= quietHoursStart || hour < quietHoursEnd;
  }

  /** Check if a specific channel is enabled */
  isChannelEnabled(channel: NotificationChannel): boolean {
    return this.prefs.enabled && this.prefs.channels[channel] && !this.isInQuietHours();
  }

  /** Update notification preferences */
  updatePreferences(prefs: Partial<NotificationPreferences>): void {
    this.prefs = { ...this.prefs, ...prefs };
  }

  /** Get current preferences */
  getPreferences(): NotificationPreferences {
    return { ...this.prefs };
  }

  /**
   * Schedule a local notification immediately.
   * On native: uses expo-notifications scheduleNotificationAsync.
   * On web: uses the Notification API.
   */
  async sendLocal(payload: ElysiumNotificationPayload): Promise<void> {
    if (!this.isChannelEnabled(payload.channel)) return;

    if (Platform.OS === "web") {
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("Elysium", { body: payload.body, icon: "/favicon.ico" });
      }
      return;
    }

    try {
      const { scheduleNotificationAsync } = (await import("expo-notifications")) as any;
      await scheduleNotificationAsync({
        content: {
          title: "Elysium",
          body: payload.body,
          data: { ...payload, deepLink: notificationToDeepLink(payload) },
          sound: this.prefs.soundEnabled ? "default" : undefined,
        },
        trigger: null, // immediate
      });
    } catch {
      // expo-notifications not available
    }
  }

  /**
   * Schedule a notification for a future time.
   */
  async scheduleAt(payload: ElysiumNotificationPayload, date: Date): Promise<void> {
    if (!this.isChannelEnabled(payload.channel)) return;

    if (Platform.OS === "web") {
      // Web doesn't support scheduled notifications well; send immediately if close
      const diff = date.getTime() - Date.now();
      if (diff < 5000) {
        await this.sendLocal(payload);
      }
      return;
    }

    try {
      const { scheduleNotificationAsync } = (await import("expo-notifications")) as any;
      await scheduleNotificationAsync({
        content: {
          title: "Elysium",
          body: payload.body,
          data: { ...payload, deepLink: notificationToDeepLink(payload) },
          sound: this.prefs.soundEnabled ? "default" : undefined,
        },
        trigger: date,
      });
    } catch {
      // expo-notifications not available
    }
  }

  /**
   * Register a listener for incoming notification payloads.
   * Returns an unsubscribe function.
   */
  onNotification(listener: (payload: ElysiumNotificationPayload) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Cancel all pending notifications.
   */
  async cancelAll(): Promise<void> {
    if (Platform.OS === "web") return;
    try {
      const { cancelAllScheduledNotificationsAsync } = (await import("expo-notifications")) as any;
      await cancelAllScheduledNotificationsAsync();
    } catch {
      // expo-notifications not available
    }
  }

  /**
   * Get the badge count (iOS only).
   */
  async getBadgeCount(): Promise<number> {
    if (Platform.OS === "web") return 0;
    try {
      const { getBadgeCountAsync } = (await import("expo-notifications")) as any;
      return await getBadgeCountAsync();
    } catch {
      return 0;
    }
  }

  /**
   * Set the badge count (iOS only).
   */
  async setBadgeCount(count: number): Promise<void> {
    if (Platform.OS === "web") return;
    try {
      const { setBadgeCountAsync } = (await import("expo-notifications")) as any;
      await setBadgeCountAsync(count);
    } catch {
      // expo-notifications not available
    }
  }
}

export const NotificationService = new NotificationServiceImpl();
