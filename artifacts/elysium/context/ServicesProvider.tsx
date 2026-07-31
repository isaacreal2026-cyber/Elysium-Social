/**
 * Elysium Services Provider
 *
 * Initializes all services and provides them via React context.
 * This provider wraps the existing ResonanceProvider to add:
 * - Expanded seed data (42 additional users)
 * - Real-time feed updates
 * - Push notifications
 * - Content moderation
 * - Performance monitoring
 * - Media picker
 * - Contact import
 * - Auth service
 *
 * This is a NEW file — it does not alter ResonanceContext.
 * It is used INSTEAD of directly using ResonanceProvider in _layout.tsx.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useResonance } from "@/context/ResonanceContext";
import { NotificationService } from "@/services/notifications";
import { MediaPicker } from "@/services/media-picker";
import { ContactImport } from "@/services/contact-import";
import { AuthService } from "@/services/auth";
import { ContentModeration } from "@/services/content-moderation";
import { RealtimeService } from "@/services/realtime";
import { ResonanceEngine } from "@/services/resonance-engine";
import { PerformanceService } from "@/services/performance";
import {
  EXPANDED_USERS,
  EXPANDED_POSTS,
  EXPANDED_VOICE_ROOMS,
} from "@/services/seed-expansion";
import type { ElysiumUser, Post, VoiceRoom } from "@/lib/types";
import type { UserSuggestion, HubSuggestion, PostRanking } from "@/services/resonance-engine";
import type { MediaResult } from "@/services/media-picker";
import type { ContactMatch } from "@/services/contact-import";
import type { ModerationResult } from "@/services/content-moderation";
import type { AuthUser } from "@/services/auth";
import type { ConnectionStatus } from "@/services/realtime";
import type { NotificationPreferences } from "@/services/notifications";

// ── Types ──────────────────────────────────────────────────────

export interface ServicesCtxValue {
  // Expanded data
  allUsers: ElysiumUser[];
  allPosts: Post[];
  allVoiceRooms: VoiceRoom[];

  // Resonance Engine
  rankedPosts: PostRanking[];
  userSuggestions: UserSuggestion[];
  hubSuggestions: HubSuggestion[];

  // Service access
  notifications: typeof NotificationService;
  mediaPicker: typeof MediaPicker;
  contactImport: typeof ContactImport;
  auth: typeof AuthService;
  moderation: typeof ContentModeration;
  realtime: typeof RealtimeService;
  performance: typeof PerformanceService;
  engine: typeof ResonanceEngine;

  // Real-time status
  realtimeStatus: ConnectionStatus;

  // Auth state
  authUser: AuthUser | null;

  // Convenience methods
  pickPhoto: () => Promise<MediaResult | null>;
  takePhoto: () => Promise<MediaResult | null>;
  pickVideo: () => Promise<MediaResult | null>;
  takeVideo: () => Promise<MediaResult | null>;
  getPhoneContacts: () => Promise<import("@/services/contact-import").PhoneContact[]>;
  matchContacts: (contacts: import("@/services/contact-import").PhoneContact[]) => Promise<ContactMatch[]>;
  moderateContent: (text: string) => Promise<ModerationResult>;
  sendNotification: (payload: import("@/services/notifications").ElysiumNotificationPayload) => Promise<void>;
  signInWithGoogle: () => Promise<AuthUser | null>;
  signInWithApple: () => Promise<AuthUser | null>;
  signInAnonymously: () => Promise<AuthUser | null>;
  signOut: () => Promise<void>;
}

const ServicesCtx = createContext<ServicesCtxValue | null>(null);

// ── Provider ───────────────────────────────────────────────────

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const resonance = useResonance();
  const [realtimeStatus, setRealtimeStatus] = useState<ConnectionStatus>("disconnected");
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const realtimeListenerRef = useRef<(() => void) | null>(null);

  // ── Expanded data ──────────────────────────────────────────
  const allUsers = useMemo(
    () => [...resonance.users, ...EXPANDED_USERS],
    [resonance.users],
  );

  const allPosts = useMemo(
    () => [...resonance.posts, ...EXPANDED_POSTS],
    [resonance.posts],
  );

  const allVoiceRooms = useMemo(
    () => [...resonance.voiceRooms, ...EXPANDED_VOICE_ROOMS],
    [resonance.voiceRooms],
  );

  // ── Resonance Engine ───────────────────────────────────────
  const selfUser = useMemo(
    () => resonance.userById(resonance.selfId),
    [resonance, resonance.selfId],
  );

  const rankedPosts = useMemo(() => {
    if (!selfUser) return allPosts.map((p) => ({ post: p, score: 0, signals: { alignment: 0, interaction: 0, recency: 0, network: 0, quality: 0, diversity: 0 } }));
    return ResonanceEngine.rankPosts(allPosts, selfUser, resonance.following);
  }, [allPosts, selfUser, resonance.following]);

  const userSuggestions = useMemo(() => {
    if (!selfUser) return [];
    return ResonanceEngine.suggestUsers(allUsers, selfUser, resonance.following);
  }, [allUsers, selfUser, resonance.following]);

  const hubSuggestions = useMemo(() => {
    if (!selfUser) return [];
    return ResonanceEngine.suggestHubs(resonance.hubs, selfUser);
  }, [resonance.hubs, selfUser]);

  // ── Service initialization ─────────────────────────────────
  useEffect(() => {
    // Initialize performance monitoring
    PerformanceService.init();

    // Initialize auth
    AuthService.init();
    const unsubAuth = AuthService.onAuthStateChanged((user) => {
      setAuthUser(user as AuthUser | null);
    });

    // Connect real-time
    RealtimeService.connect(resonance.selfId);
    const unsubStatus = RealtimeService.onStatusChange((status) => {
      setRealtimeStatus(status);
    });

    // Listen for real-time events and update resonance
    const unsubNewPost = RealtimeService.on("new_post", (post) => {
      // In a real app, this would add the post to the state
      // For now, we just log it
    });

    const unsubResonance = RealtimeService.on("resonance", (data) => {
      // In a real app, this would update resonance counts
    });

    // Initialize notifications
    NotificationService.init().catch(() => {});

    return () => {
      PerformanceService.shutdown();
      RealtimeService.disconnect();
      unsubAuth();
      unsubStatus();
      unsubNewPost();
      unsubResonance();
    };
  }, [resonance.selfId]);

  // ── Convenience methods ─────────────────────────────────────

  const pickPhoto = useCallback(() => MediaPicker.pickPhoto(), []);
  const takePhoto = useCallback(() => MediaPicker.takePhoto(), []);
  const pickVideo = useCallback(() => MediaPicker.pickVideo(), []);
  const takeVideo = useCallback(() => MediaPicker.takeVideo(), []);

  const getPhoneContacts = useCallback(() => ContactImport.getPhoneContacts(), []);

  const matchContacts = useCallback(
    (contacts: import("@/services/contact-import").PhoneContact[]) =>
      ContactImport.findElysiumUsers(contacts, allUsers),
    [allUsers],
  );

  const moderateContent = useCallback(
    (text: string) => ContentModeration.moderate(text),
    [],
  );

  const sendNotification = useCallback(
    (payload: import("@/services/notifications").ElysiumNotificationPayload) =>
      NotificationService.sendLocal(payload),
    [],
  );

  const signInWithGoogle = useCallback(() => AuthService.signInWithGoogle() as Promise<AuthUser | null>, []);
  const signInWithApple = useCallback(() => AuthService.signInWithApple() as Promise<AuthUser | null>, []);
  const signInAnonymously = useCallback(() => AuthService.signInAnonymously() as Promise<AuthUser | null>, []);
  const signOut = useCallback(() => AuthService.signOut(), []);

  // ── Context value ──────────────────────────────────────────

  const value = useMemo<ServicesCtxValue>(
    () => ({
      allUsers,
      allPosts,
      allVoiceRooms,
      rankedPosts,
      userSuggestions,
      hubSuggestions,
      notifications: NotificationService,
      mediaPicker: MediaPicker,
      contactImport: ContactImport,
      auth: AuthService,
      moderation: ContentModeration,
      realtime: RealtimeService,
      performance: PerformanceService,
      engine: ResonanceEngine,
      realtimeStatus,
      authUser,
      pickPhoto,
      takePhoto,
      pickVideo,
      takeVideo,
      getPhoneContacts,
      matchContacts,
      moderateContent,
      sendNotification,
      signInWithGoogle,
      signInWithApple,
      signInAnonymously,
      signOut,
    }),
    [
      allUsers, allPosts, allVoiceRooms,
      rankedPosts, userSuggestions, hubSuggestions,
      realtimeStatus, authUser,
      pickPhoto, takePhoto, pickVideo, takeVideo,
      getPhoneContacts, matchContacts,
      moderateContent, sendNotification,
      signInWithGoogle, signInWithApple, signInAnonymously, signOut,
    ],
  );

  return <ServicesCtx.Provider value={value}>{children}</ServicesCtx.Provider>;
}

export function useServices(): ServicesCtxValue {
  const ctx = useContext(ServicesCtx);
  if (!ctx) throw new Error("useServices must be used within ServicesProvider");
  return ctx;
}
