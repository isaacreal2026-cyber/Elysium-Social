export type ResonanceKind = "spark" | "flame" | "echo" | "sync" | "resonate" | "link";

export type PersonalityTag = string;

export interface ElysiumUser {
  id: string;
  name: string;
  handle: string;
  avatarColor: string;
  avatarGlyph: string;
  bio: string;
  introVoiceSeconds: number;
  city: string;
  tags: PersonalityTag[];
  destinations: string[];
  alignmentScore: number;
  weeklyVisitors: number;
  followers: number;
  following: number;
  online: boolean;
}

export interface ResonanceCounts {
  spark: number;
  flame: number;
  echo: number;
  sync: number;
  resonate: number;
  link: number;
}

export type PostKind =
  | "classic"
  | "voice"
  | "destiny"
  | "project"
  | "poll"
  | "question"
  | "media";

export interface Post {
  id: string;
  authorId: string;
  kind: PostKind;
  body: string;
  mediaTone?: "nebula1" | "nebula2" | "nebula3" | "none";
  destinations?: string[];
  voiceSeconds?: number;
  poll?: { options: { label: string; votes: number }[] };
  project?: { tasks: { label: string; done: boolean }[] };
  resonance: ResonanceCounts;
  energy: number;
  createdAt: number;
  nestedPostIds?: string[];
  commentCount: number;
  shareCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  body: string;
  voiceSeconds?: number;
  laughThread?: boolean;
  resonance: number;
  createdAt: number;
}

export interface DestinyStory {
  id: string;
  authorId: string;
  caption: string;
  destinations: string[];
  toneIndex: number;
  resonance: number;
  viewers: number;
  createdAt: number;
}

export interface NexusHub {
  id: string;
  name: string;
  tagline: string;
  members: number;
  pulse: number;
  toneIndex: number;
  online: string[];
  postIds: string[];
  projectMode: boolean;
}

export interface MessageThread {
  id: string;
  participantIds: string[];
  lastMessage: string;
  unread: number;
  voice: boolean;
  pinned: boolean;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  authorId: string;
  body: string;
  voiceSeconds?: number;
  createdAt: number;
}

export interface VoiceRoom {
  id: string;
  topic: string;
  vibe: string;
  hostId: string;
  speakers: string[];
  listeners: number;
  live: boolean;
}

export interface LearnPath {
  id: string;
  title: string;
  curator: string;
  modules: number;
  progress: number;
  toneIndex: number;
  category: string;
}

export type NotificationKind =
  | "resonance"
  | "comment"
  | "follow"
  | "mention"
  | "hub_invite"
  | "voice_live"
  | "story_view";

export interface ElysiumNotification {
  id: string;
  kind: NotificationKind;
  actorId: string;
  postId?: string;
  hubId?: string;
  voiceRoomId?: string;
  body: string;
  createdAt: number;
  read: boolean;
}

export interface TrendingTag {
  tag: string;
  posts: number;
  delta: number;
  toneIndex: number;
}
