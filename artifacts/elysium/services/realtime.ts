/**
 * Elysium Real-Time Feed Service
 *
 * Provides real-time updates via WebSocket or Server-Sent Events (SSE).
 * Handles: new posts, resonance updates, voice room changes,
 * notifications, typing indicators, and presence.
 *
 * This module is a NEW file — it does not alter any existing code.
 * The ResonanceContext can import this to receive live updates.
 *
 * Usage:
 *   import { RealtimeService } from "@/services/realtime";
 *   RealtimeService.connect(userId);
 *   RealtimeService.on("new_post", (post) => { ... });
 *   RealtimeService.on("resonance", (data) => { ... });
 */

import { Platform } from "react-native";

// ── Types ──────────────────────────────────────────────────────

export type RealtimeEventType =
  | "new_post"
  | "new_comment"
  | "resonance"
  | "follow"
  | "voice_room_update"
  | "notification"
  | "typing"
  | "presence"
  | "hub_update"
  | "story_update"
  | "reconnect";

export interface RealtimeEvent {
  type: RealtimeEventType;
  payload: any;
  timestamp: number;
  id: string;
}

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "reconnecting" | "error";

export interface RealtimeConfig {
  wsUrl: string;
  sseUrl: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  enablePresence: boolean;
  enableTypingIndicators: boolean;
}

const DEFAULT_CONFIG: RealtimeConfig = {
  wsUrl: process.env.EXPO_PUBLIC_WS_URL ?? "wss://elysium.social/ws",
  sseUrl: process.env.EXPO_PUBLIC_SSE_URL ?? "https://elysium.social/sse",
  reconnectInterval: 3000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000,
  enablePresence: true,
  enableTypingIndicators: true,
};

// ── Service ────────────────────────────────────────────────────

class RealtimeServiceImpl {
  private ws: WebSocket | null = null;
  private eventSource: EventSource | null = null;
  private config: RealtimeConfig = DEFAULT_CONFIG;
  private status: ConnectionStatus = "disconnected";
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: Map<RealtimeEventType, Set<(payload: any) => void>> = new Map();
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
  private messageQueue: RealtimeEvent[] = []; // Queue for offline messages
  private lastEventId: string | null = null;

  /**
   * Connect to the real-time service.
   * Tries WebSocket first, falls back to SSE, then simulated.
   */
  async connect(userId: string): Promise<void> {
    if (this.status === "connected" || this.status === "connecting") return;
    this.userId = userId;
    this.setStatus("connecting");

    // Try WebSocket first
    const wsConnected = await this.connectWebSocket();
    if (wsConnected) return;

    // Fallback to SSE
    const sseConnected = await this.connectSSE();
    if (sseConnected) return;

    // Fallback to simulated
    console.warn("[ElysiumRealtime] No real-time connection available, using simulated events");
    this.startSimulatedEvents();
  }

  /**
   * Disconnect from the real-time service.
   */
  disconnect(): void {
    this.cleanup();
    this.setStatus("disconnected");
  }

  /**
   * Get the current connection status.
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Register a listener for a specific event type.
   * Returns an unsubscribe function.
   */
  on(event: RealtimeEventType, listener: (payload: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  /**
   * Register a listener for connection status changes.
   * Returns an unsubscribe function.
   */
  onStatusChange(listener: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  /**
   * Send a message through the WebSocket.
   */
  send(event: RealtimeEventType, payload: any): void {
    const message: RealtimeEvent = {
      type: event,
      payload,
      timestamp: Date.now(),
      id: `evt-${Date.now().toString(36)}`,
    };

    if (this.ws && this.status === "connected") {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue for later
      this.messageQueue.push(message);
    }
  }

  /**
   * Send a typing indicator.
   */
  sendTyping(threadId: string): void {
    if (!this.config.enableTypingIndicators) return;
    this.send("typing", { threadId, userId: this.userId });
  }

  /**
   * Update presence status.
   */
  updatePresence(online: boolean, currentScreen?: string): void {
    if (!this.config.enablePresence) return;
    this.send("presence", { userId: this.userId, online, currentScreen });
  }

  // ── WebSocket ──────────────────────────────────────────────

  private async connectWebSocket(): Promise<boolean> {
    if (Platform.OS === "web" && typeof WebSocket === "undefined") return false;

    try {
      return new Promise((resolve) => {
        const ws = new WebSocket(`${this.config.wsUrl}?userId=${this.userId}`);

        ws.onopen = () => {
          this.ws = ws;
          this.setStatus("connected");
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.flushMessageQueue();
          resolve(true);
        };

        ws.onmessage = (event) => {
          try {
            const data: RealtimeEvent = JSON.parse(event.data);
            this.handleEvent(data);
          } catch {
            // Invalid message
          }
        };

        ws.onerror = () => {
          resolve(false);
        };

        ws.onclose = () => {
          if (this.status === "connected") {
            this.attemptReconnect();
          }
        };

        // Timeout
        setTimeout(() => {
          if (this.status !== "connected") {
            ws.close();
            resolve(false);
          }
        }, 5000);
      });
    } catch {
      return false;
    }
  }

  // ── SSE ────────────────────────────────────────────────────

  private async connectSSE(): Promise<boolean> {
    if (typeof EventSource === "undefined") return false;

    try {
      const es = new EventSource(`${this.config.sseUrl}?userId=${this.userId}`);

      return new Promise((resolve) => {
        es.onopen = () => {
          this.eventSource = es;
          this.setStatus("connected");
          this.reconnectAttempts = 0;
          resolve(true);
        };

        es.onmessage = (event) => {
          try {
            const data: RealtimeEvent = JSON.parse(event.data);
            this.handleEvent(data);
          } catch {
            // Invalid message
          }
        };

        es.onerror = () => {
          if (this.status === "connected") {
            this.attemptReconnect();
          }
          resolve(false);
        };

        // Timeout
        setTimeout(() => {
          if (this.status !== "connected") {
            es.close();
            resolve(false);
          }
        }, 5000);
      });
    } catch {
      return false;
    }
  }

  // ── Simulated events ───────────────────────────────────────

  private simulatedTimer: ReturnType<typeof setInterval> | null = null;

  private startSimulatedEvents(): void {
    this.setStatus("connected");

    // Simulate periodic events for demo purposes
    this.simulatedTimer = setInterval(() => {
      const events: RealtimeEventType[] = ["resonance", "notification", "voice_room_update"];
      const type = events[Math.floor(Math.random() * events.length)];

      let payload: any;
      switch (type) {
        case "resonance":
          payload = { postId: "p-1", kind: "spark", count: Math.floor(Math.random() * 10) + 1 };
          break;
        case "notification":
          payload = { kind: "resonance", actorId: "u-aria", body: "sparked your post" };
          break;
        case "voice_room_update":
          payload = { roomId: "vr-1", listeners: 180 + Math.floor(Math.random() * 20) };
          break;
      }

      this.handleEvent({
        type,
        payload,
        timestamp: Date.now(),
        id: `sim-${Date.now().toString(36)}`,
      });
    }, 15000); // Every 15 seconds
  }

  // ── Event handling ─────────────────────────────────────────

  private handleEvent(event: RealtimeEvent): void {
    this.lastEventId = event.id;

    // Notify listeners
    const typeListeners = this.listeners.get(event.type);
    if (typeListeners) {
      typeListeners.forEach((listener) => {
        try {
          listener(event.payload);
        } catch (e) {
          console.warn("[ElysiumRealtime] Listener error:", e);
        }
      });
    }

    // Also notify wildcard listeners (those listening to "all")
    const allListeners = this.listeners.get("reconnect" as RealtimeEventType);
    // We don't have a wildcard, but we could add one
  }

  // ── Connection management ──────────────────────────────────

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.setStatus("error");
      return;
    }

    this.setStatus("reconnecting");
    this.reconnectAttempts++;

    const delay = this.config.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1);

    this.reconnectTimer = setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId);
      }
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.status === "connected") {
        this.ws.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
      }
    }, this.config.heartbeatInterval);
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift()!;
      if (this.ws && this.status === "connected") {
        this.ws.send(JSON.stringify(msg));
      }
    }
  }

  private cleanup(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.simulatedTimer) {
      clearInterval(this.simulatedTimer);
      this.simulatedTimer = null;
    }
    this.messageQueue = [];
    this.reconnectAttempts = 0;
  }

  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    this.statusListeners.forEach((l) => {
      try {
        l(status);
      } catch {
        // ignore
      }
    });
  }
}

export const RealtimeService = new RealtimeServiceImpl();
