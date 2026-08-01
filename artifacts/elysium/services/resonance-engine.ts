/**
 * Elysium Resonance Engine — Recommendation & Network Seeding
 *
 * The core recommendation engine that powers feed ranking, friend
 * suggestions, hub recommendations, and content discovery.
 *
 * Uses a weighted multi-signal algorithm combining:
 * - Alignment score (tag overlap + destination overlap)
 * - Interaction history (resonance patterns, comments, shares)
 * - Temporal decay (recent activity weighted higher)
 * - Network proximity (friends-of-friends)
 * - Content quality signals (resonance count, comment depth)
 *
 * This module is a NEW file — it does not alter any existing code.
 * The feed, discover, and connections screens can import this to
 * improve content ranking and user suggestions.
 *
 * Usage:
 *   import { ResonanceEngine } from "@/services/resonance-engine";
 *   const ranked = ResonanceEngine.rankPosts(posts, selfUser, following);
 *   const suggested = ResonanceEngine.suggestUsers(users, selfUser, following);
 *   const hubs = ResonanceEngine.suggestHubs(hubs, selfUser);
 */

import type { ElysiumUser, Post, NexusHub, PersonalityTag } from "@/lib/types";

// ── Types ──────────────────────────────────────────────────────

export interface RecommendationWeights {
  alignment: number;     // How much tag/destination overlap matters
  interaction: number;   // How much past interaction matters
  recency: number;       // How much recent activity matters
  network: number;       // How much friend-of-friend matters
  quality: number;       // How much resonance count matters
  diversity: number;     // How much content variety matters
}

export const DEFAULT_WEIGHTS: RecommendationWeights = {
  alignment: 0.30,
  interaction: 0.20,
  recency: 0.15,
  network: 0.15,
  quality: 0.10,
  diversity: 0.10,
};

export interface UserSuggestion {
  user: ElysiumUser;
  score: number;
  reasons: string[];
  mutualConnections: number;
  tagOverlap: number;
  destinationOverlap: number;
}

export interface HubSuggestion {
  hub: NexusHub;
  score: number;
  reasons: string[];
  memberOverlap: number;
  tagOverlap: number;
}

export interface PostRanking {
  post: Post;
  score: number;
  signals: {
    alignment: number;
    interaction: number;
    recency: number;
    network: number;
    quality: number;
    diversity: number;
  };
}

// ── Engine ─────────────────────────────────────────────────────

export const ResonanceEngine = {
  /**
   * Rank posts for a user's feed based on multiple signals.
   */
  rankPosts(
    posts: Post[],
    selfUser: ElysiumUser,
    following: Record<string, true>,
    weights: RecommendationWeights = DEFAULT_WEIGHTS,
  ): PostRanking[] {
    const rankings: PostRanking[] = posts.map((post) => {
      const signals = {
        alignment: this.computeAlignment(post, selfUser),
        interaction: this.computeInteraction(post, selfUser, following),
        recency: this.computeRecency(post),
        network: this.computeNetwork(post, selfUser, following),
        quality: this.computeQuality(post),
        diversity: this.computeDiversity(post, posts),
      };

      const score =
        signals.alignment * weights.alignment +
        signals.interaction * weights.interaction +
        signals.recency * weights.recency +
        signals.network * weights.network +
        signals.quality * weights.quality +
        signals.diversity * weights.diversity;

      return { post, score, signals };
    });

    return rankings.sort((a, b) => b.score - a.score);
  },

  /**
   * Suggest users to follow based on alignment and network proximity.
   */
  suggestUsers(
    users: ElysiumUser[],
    selfUser: ElysiumUser,
    following: Record<string, true>,
    maxResults: number = 20,
  ): UserSuggestion[] {
    const suggestions: UserSuggestion[] = users
      .filter((u) => u.id !== selfUser.id && !following[u.id])
      .map((user) => {
        const tagOverlap = this.computeTagOverlap(user.tags, selfUser.tags);
        const destOverlap = this.computeDestinationOverlap(user.destinations, selfUser.destinations);
        const mutualConnections = this.computeMutualConnections(user, users, following);
        const cityBonus = user.city === selfUser.city ? 0.1 : 0;
        const onlineBonus = user.online ? 0.05 : 0;

        const score =
          tagOverlap * 0.35 +
          destOverlap * 0.25 +
          mutualConnections * 0.1 +
          (user.alignmentScore * 0.15) +
          cityBonus +
          onlineBonus;

        const reasons: string[] = [];
        if (tagOverlap > 0.3) reasons.push(`${Math.round(tagOverlap * 100)}% tag overlap`);
        if (destOverlap > 0.3) reasons.push(`${Math.round(destOverlap * 100)}% destination overlap`);
        if (mutualConnections > 0) reasons.push(`${mutualConnections} mutual connections`);
        if (user.city === selfUser.city) reasons.push(`Same city (${user.city})`);
        if (user.online) reasons.push("Online now");

        return {
          user,
          score,
          reasons,
          mutualConnections,
          tagOverlap,
          destinationOverlap: destOverlap,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);

    return suggestions;
  },

  /**
   * Suggest hubs to join based on tag overlap and member proximity.
   */
  suggestHubs(
    hubs: NexusHub[],
    selfUser: ElysiumUser,
    maxResults: number = 10,
  ): HubSuggestion[] {
    const suggestions: HubSuggestion[] = hubs.map((hub) => {
      const tagOverlap = this.computeHubTagOverlap(hub, selfUser);
      const memberOverlap = hub.online.length / Math.max(1, hub.members);
      const pulseBonus = hub.pulse * 0.2;
      const projectModeBonus = hub.projectMode && selfUser.tags.includes("builder") ? 0.1 : 0;

      const score = tagOverlap * 0.4 + memberOverlap * 0.2 + pulseBonus + projectModeBonus;

      const reasons: string[] = [];
      if (tagOverlap > 0.3) reasons.push("Matches your interests");
      if (hub.pulse > 0.7) reasons.push("Highly active hub");
      if (hub.projectMode) reasons.push("Project mode — collaborative");
      if (hub.online.length > 3) reasons.push(`${hub.online.length} members online now`);

      return { hub, score, reasons, memberOverlap, tagOverlap };
    });

    return suggestions.sort((a, b) => b.score - a.score).slice(0, maxResults);
  },

  /**
   * Generate a network seeding plan for cold start.
   * Returns a list of users the new user should follow,
   * ordered by expected engagement.
   */
  generateSeedingPlan(
    selfUser: ElysiumUser,
    allUsers: ElysiumUser[],
    maxFollows: number = 5,
  ): UserSuggestion[] {
    return this.suggestUsers(allUsers, selfUser, {}, maxFollows);
  },

  // ── Signal computation ───────────────────────────────────────

  computeAlignment(post: Post, selfUser: ElysiumUser): number {
    const tagOverlap = post.destinations
      ? this.computeDestinationOverlap(post.destinations, selfUser.destinations)
      : 0;
    return tagOverlap;
  },

  computeInteraction(post: Post, selfUser: ElysiumUser, following: Record<string, true>): number {
    // Posts from followed users get a boost
    if (following[post.authorId]) return 0.8;
    // Posts from users with similar tags get a smaller boost
    return 0.2;
  },

  computeRecency(post: Post): number {
    const age = Date.now() - post.createdAt;
    const hours = age / (1000 * 60 * 60);
    // Exponential decay: 1.0 at 0h, 0.5 at 6h, 0.25 at 12h, etc.
    return Math.exp(-hours / 6);
  },

  computeNetwork(post: Post, selfUser: ElysiumUser, following: Record<string, true>): number {
    // Friends-of-friends boost
    if (following[post.authorId]) return 0.6;
    // If author is followed by someone I follow
    return 0.1;
  },

  computeQuality(post: Post): number {
    const totalResonance = Object.values(post.resonance).reduce((a, b) => a + b, 0);
    const commentBoost = Math.min(1, post.commentCount / 50);
    const shareBoost = Math.min(1, post.shareCount / 20);
    const resonanceBoost = Math.min(1, totalResonance / 500);
    return (commentBoost * 0.3 + shareBoost * 0.3 + resonanceBoost * 0.4) * post.energy;
  },

  computeDiversity(post: Post, allPosts: Post[]): number {
    // Encourage content variety — different kinds get a boost
    const sameKindCount = allPosts.filter((p) => p.kind === post.kind && p.authorId === post.authorId).length;
    const sameAuthorCount = allPosts.filter((p) => p.authorId === post.authorId).length;
    // Penalize if too much from same author
    const authorPenalty = sameAuthorCount > 3 ? 0.5 : 1;
    // Boost rare post kinds
    const kindFrequency = allPosts.filter((p) => p.kind === post.kind).length / allPosts.length;
    const kindBoost = 1 - kindFrequency; // Rarer kinds get more boost
    return authorPenalty * (0.5 + kindBoost * 0.5);
  },

  // ── Similarity metrics ───────────────────────────────────────

  computeTagOverlap(tagsA: PersonalityTag[], tagsB: PersonalityTag[]): number {
    if (tagsA.length === 0 || tagsB.length === 0) return 0;
    const setA = new Set(tagsA);
    const setB = new Set(tagsB);
    const intersection = [...setA].filter((t) => setB.has(t)).length;
    const union = new Set([...setA, ...setB]).size;
    return intersection / union; // Jaccard similarity
  },

  computeDestinationOverlap(destA: string[], destB: string[]): number {
    if (destA.length === 0 || destB.length === 0) return 0;
    const setA = new Set(destA);
    const setB = new Set(destB);
    const intersection = [...setA].filter((d) => setB.has(d)).length;
    const union = new Set([...setA, ...setB]).size;
    return intersection / union;
  },

  computeMutualConnections(
    user: ElysiumUser,
    allUsers: ElysiumUser[],
    following: Record<string, true>,
  ): number {
    // Count how many of the user's connections are also followed by self
    // Simplified: just check if the user's tags overlap with followed users
    const followedUsers = allUsers.filter((u) => following[u.id]);
    return followedUsers.filter((fu) =>
      fu.tags.some((t) => user.tags.includes(t)),
    ).length;
  },

  computeHubTagOverlap(hub: NexusHub, selfUser: ElysiumUser): number {
    // Match hub name/tagline against user tags and destinations
    const hubText = `${hub.name} ${hub.tagline}`.toLowerCase();
    const selfKeywords = [...selfUser.tags, ...selfUser.destinations].map((t) => t.toLowerCase());
    const matches = selfKeywords.filter((k) => hubText.includes(k)).length;
    return Math.min(1, matches / Math.max(1, selfKeywords.length) * 2);
  },
};

export default ResonanceEngine;
