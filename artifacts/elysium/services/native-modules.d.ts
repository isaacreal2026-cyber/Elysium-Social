/**
 * Type declarations for optional native modules.
 * These packages are not installed by default but are required
 * for the full feature set. They are dynamically imported at
 * runtime so the app works even without them.
 */

declare module "expo-notifications" {
  export interface NotificationContent {
    title?: string;
    body?: string;
    data?: any;
    sound?: string | boolean;
  }

  export interface NotificationRequest {
    identifier: string;
    content: NotificationContent;
    trigger: any;
  }

  export function requestPermissionsAsync(): Promise<{ status: string }>;
  export function getExpoPushTokenAsync(options?: { projectId?: string }): Promise<{ data: string }>;
  export function scheduleNotificationAsync(request: {
    content: NotificationContent;
    trigger: any;
  }): Promise<string>;
  export function cancelAllScheduledNotificationsAsync(): Promise<void>;
  export function getBadgeCountAsync(): Promise<number>;
  export function setBadgeCountAsync(count: number): Promise<void>;
  export function setNotificationChannelAsync(
    channelId: string,
    channel: {
      name: string;
      importance: number;
      vibrationPattern?: number[];
      lightColor?: string;
      sound?: string;
    },
  ): Promise<void>;

  export const AndroidImportance: {
    DEFAULT: number;
    HIGH: number;
    LOW: number;
    MAX: number;
    MIN: number;
    NONE: number;
    UNSPECIFIED: number;
  };
}

declare module "expo-contacts" {
  export interface Contact {
    id?: string;
    firstName?: string;
    lastName?: string;
    phoneNumbers?: Array<{ number?: string }>;
    emails?: Array<{ email?: string }>;
  }

  export const Fields: {
    PhoneNumbers: string;
    Emails: string;
    FirstName: string;
    LastName: string;
  };

  export function requestPermissionsAsync(): Promise<{ status: string }>;
  export function getContactsAsync(options: {
    fields: string[];
    sort?: string;
  }): Promise<{ data: Contact[] }>;
}

declare module "expo-auth-session" {
  export interface AuthSessionResult {
    type: "success" | "cancel" | "dismiss" | "error";
    authentication?: {
      idToken?: string;
      accessToken?: string;
    };
  }

  export function makeRedirectUri(options?: any): string;
  export const Google: { authEndpoint: string };
  export const Apple: { authEndpoint: string };
}
