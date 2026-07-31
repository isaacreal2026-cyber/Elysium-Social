/**
 * Elysium Services — Unified Export
 *
 * Central import point for all service modules.
 * Each service is a NEW file that does not alter any existing code.
 *
 * Services:
 * - notifications:    Push notification service (expo-notifications)
 * - media-picker:     Camera/gallery picker (expo-image-picker)
 * - contact-import:   Phone contact import (expo-contacts)
 * - auth:             Social login (Google, Apple, email)
 * - content-moderation: AI-powered content moderation
 * - realtime:         WebSocket/SSE real-time updates
 * - resonance-engine: Recommendation & network seeding
 * - seed-expansion:   Expanded user network for cold start
 * - performance:      Performance monitoring & optimization
 */

export { NotificationService, DEFAULT_NOTIFICATION_PREFS } from "./notifications";
export type { NotificationPreferences, NotificationChannel, ElysiumNotificationPayload } from "./notifications";

export { MediaPicker } from "./media-picker";
export type { MediaResult, MediaType, MediaPickerOptions } from "./media-picker";

export { ContactImport } from "./contact-import";
export type { PhoneContact, ContactMatch, ImportResult } from "./contact-import";

export { AuthService } from "./auth";
export type { AuthUser, AuthProvider, AuthState } from "./auth";

export { ContentModeration, DEFAULT_MODERATION_CONFIG } from "./content-moderation";
export type { ModerationResult, ModerationSeverity, ModerationCategory, ModerationConfig } from "./content-moderation";

export { RealtimeService } from "./realtime";
export type { RealtimeEvent, RealtimeEventType, ConnectionStatus } from "./realtime";

export { ResonanceEngine, DEFAULT_WEIGHTS } from "./resonance-engine";
export type { RecommendationWeights, UserSuggestion, HubSuggestion, PostRanking } from "./resonance-engine";

export { EXPANDED_USERS, EXPANDED_POSTS, EXPANDED_VOICE_ROOMS } from "./seed-expansion";

export { PerformanceService } from "./performance";
export type { PerformanceMetrics, PerformanceConfig } from "./performance";
