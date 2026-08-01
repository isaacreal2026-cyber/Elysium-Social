import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import {
  SEED_CHATS,
  SEED_COMMENTS,
  SEED_FOLLOWING,
  SEED_HUBS,
  SEED_NOTIFICATIONS,
  SEED_PATHS,
  SEED_POSTS,
  SEED_STORIES,
  SEED_THREADS,
  SEED_TRENDING,
  SEED_USERS,
  SEED_VOICE_ROOMS,
} from "@/lib/seed";
import { loadJSON, makeId, saveJSON } from "@/lib/storage";
import type {
  ChatMessage,
  Comment,
  DestinyStory,
  ElysiumNotification,
  ElysiumUser,
  LearnPath,
  MessageThread,
  NexusHub,
  Post,
  ResonanceKind,
  TrendingTag,
  VoiceRoom,
} from "@/lib/types";

interface ResonancePulse {
  id: string;
  kind: ResonanceKind;
  postId: string;
  startedAt: number;
}

interface State {
  users: ElysiumUser[];
  posts: Post[];
  comments: Comment[];
  stories: DestinyStory[];
  hubs: NexusHub[];
  threads: MessageThread[];
  chats: Record<string, ChatMessage[]>;
  voiceRooms: VoiceRoom[];
  paths: LearnPath[];
  notifications: ElysiumNotification[];
  trending: TrendingTag[];
  myResonances: Record<string, Partial<Record<ResonanceKind, true>>>;
  bookmarks: Record<string, true>;
  following: Record<string, true>;
  viewedStories: Record<string, true>;
  pulses: ResonancePulse[];
  selfId: string;
}

interface ResonanceCtx extends State {
  userById: (id: string) => ElysiumUser | undefined;
  resonate: (postId: string, kind: ResonanceKind) => void;
  hasResonated: (postId: string, kind: ResonanceKind) => boolean;
  toggleBookmark: (postId: string) => void;
  isBookmarked: (postId: string) => boolean;
  toggleFollow: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  markStoryViewed: (storyId: string) => void;
  isStoryViewed: (storyId: string) => boolean;
  unreadNotifications: number;
  unreadMessages: number;
  markAllNotificationsRead: () => void;
  addPost: (input: {
    body: string;
    kind: Post["kind"];
    destinations?: string[];
    nestedPostId?: string;
  }) => string;
  addComment: (input: {
    postId: string;
    parentId: string | null;
    body: string;
    laughThread?: boolean;
  }) => void;
  addStory: (input: { caption: string; destinations: string[] }) => void;
  sendMessage: (threadId: string, body: string) => void;
  toggleHubProjectMode: (hubId: string) => void;
  togglePathProgress: (pathId: string) => void;
  sharePost: (postId: string) => void;
  updateSelfProfile: (input: { name?: string; bio?: string; city?: string; tags?: string[]; destinations?: string[] }) => void;
  joinVoiceRoom: (roomId: string) => void;
  leaveVoiceRoom: (roomId: string) => void;
  createVoiceRoom: (input: { topic: string; vibe: string }) => string;
}

const Ctx = createContext<ResonanceCtx | null>(null);

const STORAGE_KEY = "state-v2";

const initialState: State = {
  users: SEED_USERS,
  posts: SEED_POSTS,
  comments: SEED_COMMENTS,
  stories: SEED_STORIES,
  hubs: SEED_HUBS,
  threads: SEED_THREADS,
  chats: SEED_CHATS,
  voiceRooms: SEED_VOICE_ROOMS,
  paths: SEED_PATHS,
  notifications: SEED_NOTIFICATIONS,
  trending: SEED_TRENDING,
  myResonances: {},
  bookmarks: {},
  following: Object.fromEntries(
    SEED_FOLLOWING.map((id) => [id, true as const]),
  ),
  viewedStories: {},
  pulses: [],
  selfId: "u-self",
};

export function ResonanceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await loadJSON<State | null>(STORAGE_KEY, null);
      if (mounted && stored) {
        setState({ ...initialState, ...stored, pulses: [] });
      }
      setHydrated(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const { pulses: _p, ...rest } = state;
    void saveJSON(STORAGE_KEY, rest);
  }, [state, hydrated]);

  const userById = useCallback(
    (id: string) => state.users.find((u) => u.id === id),
    [state.users],
  );

  const triggerHaptic = useCallback((kind: ResonanceKind) => {
    if (Platform.OS === "web") return;
    const map: Record<ResonanceKind, Haptics.ImpactFeedbackStyle> = {
      spark: Haptics.ImpactFeedbackStyle.Light,
      flame: Haptics.ImpactFeedbackStyle.Heavy,
      echo: Haptics.ImpactFeedbackStyle.Medium,
      sync: Haptics.ImpactFeedbackStyle.Medium,
      resonate: Haptics.ImpactFeedbackStyle.Light,
      link: Haptics.ImpactFeedbackStyle.Soft,
    };
    void Haptics.impactAsync(map[kind]).catch(() => {});
  }, []);

  const lightHaptic = useCallback(() => {
    if (Platform.OS === "web") return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  const resonate = useCallback(
    (postId: string, kind: ResonanceKind) => {
      triggerHaptic(kind);
      setState((s) => {
        const mine = s.myResonances[postId] ?? {};
        const already = mine[kind];
        const delta = already ? -1 : 1;
        return {
          ...s,
          posts: s.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  resonance: {
                    ...p.resonance,
                    [kind]: Math.max(0, p.resonance[kind] + delta),
                  },
                  energy: Math.min(1, p.energy + (already ? -0.01 : 0.02)),
                }
              : p,
          ),
          myResonances: {
            ...s.myResonances,
            [postId]: already
              ? Object.fromEntries(
                  Object.entries(mine).filter(([k]) => k !== kind),
                )
              : { ...mine, [kind]: true },
          },
          pulses: already
            ? s.pulses
            : [
                ...s.pulses,
                { id: makeId("pulse"), kind, postId, startedAt: Date.now() },
              ].slice(-10),
        };
      });
    },
    [triggerHaptic],
  );

  const hasResonated = useCallback(
    (postId: string, kind: ResonanceKind) =>
      Boolean(state.myResonances[postId]?.[kind]),
    [state.myResonances],
  );

  const toggleBookmark = useCallback<ResonanceCtx["toggleBookmark"]>(
    (postId) => {
      lightHaptic();
      setState((s) => {
        const next = { ...s.bookmarks };
        if (next[postId]) delete next[postId];
        else next[postId] = true;
        return { ...s, bookmarks: next };
      });
    },
    [lightHaptic],
  );

  const isBookmarked = useCallback(
    (postId: string) => Boolean(state.bookmarks[postId]),
    [state.bookmarks],
  );

  const toggleFollow = useCallback<ResonanceCtx["toggleFollow"]>(
    (userId) => {
      lightHaptic();
      setState((s) => {
        const next = { ...s.following };
        const wasFollowing = Boolean(next[userId]);
        if (wasFollowing) delete next[userId];
        else next[userId] = true;
        return {
          ...s,
          following: next,
          users: s.users.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  followers: Math.max(0, u.followers + (wasFollowing ? -1 : 1)),
                }
              : u.id === s.selfId
                ? {
                    ...u,
                    following: Math.max(
                      0,
                      u.following + (wasFollowing ? -1 : 1),
                    ),
                  }
                : u,
          ),
        };
      });
    },
    [lightHaptic],
  );

  const isFollowing = useCallback(
    (userId: string) => Boolean(state.following[userId]),
    [state.following],
  );

  const markStoryViewed = useCallback<ResonanceCtx["markStoryViewed"]>(
    (storyId) => {
      setState((s) => ({
        ...s,
        viewedStories: { ...s.viewedStories, [storyId]: true },
      }));
    },
    [],
  );

  const isStoryViewed = useCallback(
    (storyId: string) => Boolean(state.viewedStories[storyId]),
    [state.viewedStories],
  );

  const unreadNotifications = useMemo(
    () => state.notifications.filter((n) => !n.read).length,
    [state.notifications],
  );

  const unreadMessages = useMemo(
    () => state.threads.reduce((acc, t) => acc + t.unread, 0),
    [state.threads],
  );

  const markAllNotificationsRead = useCallback(() => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const addPost = useCallback<ResonanceCtx["addPost"]>(
    ({ body, kind, destinations, nestedPostId }) => {
      const id = makeId("p");
      const tones = ["nebula1", "nebula2", "nebula3"] as const;
      setState((s) => ({
        ...s,
        posts: [
          {
            id,
            authorId: s.selfId,
            kind,
            body,
            mediaTone:
              kind === "destiny" || kind === "media" || kind === "voice"
                ? tones[Math.floor(Math.random() * tones.length)]
                : "none",
            destinations: destinations ?? [],
            voiceSeconds: kind === "voice" ? 14 : undefined,
            resonance: {
              spark: 0,
              flame: 0,
              echo: 0,
              sync: 0,
              resonate: 0,
              link: 0,
            },
            energy: 0.05,
            createdAt: Date.now(),
            nestedPostIds: nestedPostId ? [nestedPostId] : undefined,
            commentCount: 0,
            shareCount: 0,
          },
          ...s.posts,
        ],
      }));
      return id;
    },
    [],
  );

  const addComment = useCallback<ResonanceCtx["addComment"]>(
    ({ postId, parentId, body, laughThread }) => {
      setState((s) => ({
        ...s,
        comments: [
          ...s.comments,
          {
            id: makeId("c"),
            postId,
            parentId,
            authorId: s.selfId,
            body,
            laughThread,
            resonance: 0,
            createdAt: Date.now(),
          },
        ],
        posts: s.posts.map((p) =>
          p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p,
        ),
      }));
    },
    [],
  );

  const addStory = useCallback<ResonanceCtx["addStory"]>(
    ({ caption, destinations }) => {
      setState((s) => ({
        ...s,
        stories: [
          {
            id: makeId("s"),
            authorId: s.selfId,
            caption,
            destinations,
            toneIndex: Math.floor(Math.random() * 3),
            resonance: 0,
            viewers: 0,
            createdAt: Date.now(),
          },
          ...s.stories,
        ],
      }));
    },
    [],
  );

  const sendMessage = useCallback<ResonanceCtx["sendMessage"]>(
    (threadId, body) => {
      setState((s) => ({
        ...s,
        chats: {
          ...s.chats,
          [threadId]: [
            ...(s.chats[threadId] ?? []),
            {
              id: makeId("m"),
              threadId,
              authorId: s.selfId,
              body,
              createdAt: Date.now(),
            },
          ],
        },
        threads: s.threads.map((t) =>
          t.id === threadId ? { ...t, lastMessage: body, unread: 0 } : t,
        ),
      }));
    },
    [],
  );

  const toggleHubProjectMode = useCallback<
    ResonanceCtx["toggleHubProjectMode"]
  >((hubId) => {
    setState((s) => ({
      ...s,
      hubs: s.hubs.map((h) =>
        h.id === hubId ? { ...h, projectMode: !h.projectMode } : h,
      ),
    }));
  }, []);

  const togglePathProgress = useCallback<ResonanceCtx["togglePathProgress"]>(
    (pathId) => {
      setState((s) => ({
        ...s,
        paths: s.paths.map((p) => {
          if (p.id !== pathId) return p;
          const step = 1 / Math.max(1, p.modules);
          const next = p.progress + step;
          return { ...p, progress: next > 1 ? 0 : next };
        }),
      }));
    },
    [],
  );

  const sharePost = useCallback<ResonanceCtx["sharePost"]>(
    (postId) => {
      lightHaptic();
      setState((s) => ({
        ...s,
        posts: s.posts.map((p) =>
          p.id === postId ? { ...p, shareCount: p.shareCount + 1 } : p,
        ),
      }));
    },
    [lightHaptic],
  );

  const updateSelfProfile = useCallback<ResonanceCtx["updateSelfProfile"]>(
    (input) => {
      setState((s) => ({
        ...s,
        users: s.users.map((u) =>
          u.id === s.selfId
            ? {
                ...u,
                name: input.name ?? u.name,
                bio: input.bio ?? u.bio,
                city: input.city ?? u.city,
                tags: input.tags ?? u.tags,
                destinations: input.destinations ?? u.destinations,
              }
            : u,
        ),
      }));
    },
    [],
  );

  const joinVoiceRoom = useCallback<ResonanceCtx["joinVoiceRoom"]>(
    (roomId) => {
      setState((s) => ({
        ...s,
        voiceRooms: s.voiceRooms.map((vr) =>
          vr.id === roomId
            ? {
                ...vr,
                speakers: [...vr.speakers, s.selfId],
                listeners: vr.listeners + 1,
              }
            : vr,
        ),
      }));
    },
    [],
  );

  const leaveVoiceRoom = useCallback<ResonanceCtx["leaveVoiceRoom"]>(
    (roomId) => {
      setState((s) => ({
        ...s,
        voiceRooms: s.voiceRooms.map((vr) =>
          vr.id === roomId
            ? {
                ...vr,
                speakers: vr.speakers.filter((id) => id !== s.selfId),
                listeners: Math.max(0, vr.listeners - 1),
              }
            : vr,
        ),
      }));
    },
    [],
  );

  const createVoiceRoom = useCallback<ResonanceCtx["createVoiceRoom"]>(
    (input) => {
      const id = makeId("vr");
      setState((s) => ({
        ...s,
        voiceRooms: [
          ...s.voiceRooms,
          {
            id,
            topic: input.topic,
            vibe: input.vibe,
            hostId: s.selfId,
            speakers: [s.selfId],
            listeners: 0,
            live: true,
          },
        ],
      }));
      return id;
    },
    [],
  );

  // garbage collect old pulses
  useEffect(() => {
    if (state.pulses.length === 0) return;
    const timer = setTimeout(() => {
      setState((s) => ({
        ...s,
        pulses: s.pulses.filter((p) => Date.now() - p.startedAt < 1500),
      }));
    }, 1500);
    return () => clearTimeout(timer);
  }, [state.pulses]);

  const value = useMemo<ResonanceCtx>(
    () => ({
      ...state,
      userById,
      resonate,
      hasResonated,
      toggleBookmark,
      isBookmarked,
      toggleFollow,
      isFollowing,
      markStoryViewed,
      isStoryViewed,
      unreadNotifications,
      unreadMessages,
      markAllNotificationsRead,
      addPost,
      addComment,
      addStory,
      sendMessage,
      toggleHubProjectMode,
      togglePathProgress,
      sharePost,
      updateSelfProfile,
      joinVoiceRoom,
      leaveVoiceRoom,
      createVoiceRoom,
    }),
    [
      state,
      userById,
      resonate,
      hasResonated,
      toggleBookmark,
      isBookmarked,
      toggleFollow,
      isFollowing,
      markStoryViewed,
      isStoryViewed,
      unreadNotifications,
      unreadMessages,
      markAllNotificationsRead,
      addPost,
      addComment,
      addStory,
      sendMessage,
      toggleHubProjectMode,
      togglePathProgress,
      sharePost,
      updateSelfProfile,
      joinVoiceRoom,
      leaveVoiceRoom,
      createVoiceRoom,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useResonance() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useResonance must be used within ResonanceProvider");
  return ctx;
}
