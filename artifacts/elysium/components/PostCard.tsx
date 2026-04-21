import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { ResonanceBar } from "@/components/ResonanceBar";
import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";
import type { Post } from "@/lib/types";

const TONE_IMAGES = {
  nebula1: require("@/assets/images/nebula1.png"),
  nebula2: require("@/assets/images/nebula2.png"),
  nebula3: require("@/assets/images/nebula3.png"),
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function format(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

const KIND_LABEL: Record<Post["kind"], string> = {
  classic: "Note",
  voice: "Voice",
  destiny: "Destiny",
  project: "Project",
  poll: "Poll",
  question: "Question",
  media: "Media",
};

export function PostCard({ post, nested = false }: { post: Post; nested?: boolean }) {
  const colors = useColors();
  const { userById, posts, toggleBookmark, isBookmarked, sharePost } = useResonance();
  const author = userById(post.authorId);
  const nestedPosts = (post.nestedPostIds ?? [])
    .map((id) => posts.find((p) => p.id === id))
    .filter(Boolean) as Post[];

  const cardBg = nested ? "rgba(245,240,255,0.04)" : colors.card;
  const borderColor = nested ? "rgba(245,240,255,0.06)" : colors.border;
  const bookmarked = isBookmarked(post.id);

  return (
    <Pressable
      onPress={() => router.push(`/post/${post.id}` as never)}
      style={[
        styles.card,
        { backgroundColor: cardBg, borderColor, borderRadius: colors.radius },
        nested && { marginTop: 12 },
      ]}
    >
      <View style={styles.headerRow}>
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            if (author) router.push(`/profile/${author.id}` as never);
          }}
          style={[styles.avatar, { backgroundColor: author?.avatarColor ?? colors.primary }]}
        >
          <Text style={styles.avatarText}>{author?.avatarGlyph ?? "?"}</Text>
          {author?.online ? <View style={[styles.onlineDot, { backgroundColor: colors.emerald, borderColor: colors.card }]} /> : null}
        </Pressable>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={[styles.name, { color: colors.text }]}>{author?.name}</Text>
            <Text style={[styles.dot, { color: colors.mutedForeground }]}>·</Text>
            <Text style={[styles.handle, { color: colors.mutedForeground }]}>{timeAgo(post.createdAt)}</Text>
          </View>
          <Text style={[styles.handle, { color: colors.mutedForeground }]}>
            {author?.handle} · {author?.city}
          </Text>
        </View>
        <View style={[styles.kindPill, { borderColor }]}>
          <Text style={[styles.kindText, { color: colors.mutedForeground }]}>{KIND_LABEL[post.kind]}</Text>
        </View>
      </View>

      <Text style={[styles.body, { color: colors.text }]}>{post.body}</Text>

      {post.destinations && post.destinations.length > 0 ? (
        <View style={styles.destRow}>
          {post.destinations.map((d) => (
            <Text key={d} style={[styles.hashtag, { color: colors.gold }]}>#{d}</Text>
          ))}
        </View>
      ) : null}

      {post.mediaTone && post.mediaTone !== "none" ? (
        <View style={[styles.mediaWrap, { borderRadius: colors.radius - 6 }]}>
          <Image source={TONE_IMAGES[post.mediaTone]} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient
            colors={["transparent", "rgba(7,2,26,0.85)"]}
            style={StyleSheet.absoluteFill}
          />
          {post.kind === "voice" ? (
            <View style={styles.voiceOverlay}>
              <View style={[styles.voicePlay, { backgroundColor: colors.primary }]}>
                <Feather name="play" size={16} color="#fff" />
              </View>
              <View style={styles.waveform}>
                {Array.from({ length: 26 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.wavebar,
                      { height: 6 + Math.abs(Math.sin(i * 0.7)) * 18 },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.voiceTime}>0:{String(post.voiceSeconds ?? 0).padStart(2, "0")}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {post.poll ? (
        <View style={{ marginTop: 12, gap: 8 }}>
          {post.poll.options.map((opt, i) => {
            const total = post.poll!.options.reduce((a, b) => a + b.votes, 0);
            const pct = total ? opt.votes / total : 0;
            return (
              <View key={i} style={[styles.pollRow, { borderColor }]}>
                <View style={[styles.pollFill, { width: `${pct * 100}%`, backgroundColor: colors.primary + "33" }]} />
                <Text style={[styles.pollLabel, { color: colors.text }]}>{opt.label}</Text>
                <Text style={[styles.pollPct, { color: colors.mutedForeground }]}>{Math.round(pct * 100)}%</Text>
              </View>
            );
          })}
          <Text style={[styles.pollMeta, { color: colors.mutedForeground }]}>
            {post.poll.options.reduce((a, b) => a + b.votes, 0)} votes · 14h left
          </Text>
        </View>
      ) : null}

      {post.project ? (
        <View style={[styles.projectBox, { borderColor }]}>
          <View style={styles.projectHeader}>
            <Feather name="layers" size={12} color={colors.teal} />
            <Text style={[styles.projectTitle, { color: colors.teal }]}>Project Mode</Text>
            <Text style={[styles.projectMeta, { color: colors.mutedForeground }]}>
              {post.project.tasks.filter((t) => t.done).length}/{post.project.tasks.length} done
            </Text>
          </View>
          {post.project.tasks.map((t, i) => (
            <View key={i} style={styles.taskRow}>
              <View style={[styles.taskDot, t.done && { backgroundColor: colors.teal, borderColor: colors.teal }]}>
                {t.done ? <Feather name="check" size={10} color="#0E0524" /> : null}
              </View>
              <Text style={[styles.taskLabel, { color: colors.text, opacity: t.done ? 0.6 : 1, textDecorationLine: t.done ? "line-through" : "none" }]}>
                {t.label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {nestedPosts.length > 0 ? (
        <View style={{ marginTop: 8 }}>
          <Text style={[styles.nestedLabel, { color: colors.mutedForeground }]}>↳ Nested resonance</Text>
          {nestedPosts.map((np) => (
            <PostCard key={np.id} post={np} nested />
          ))}
        </View>
      ) : null}

      <ResonanceBar postId={post.id} energy={post.energy} />

      <View style={styles.footerRow}>
        <FooterBtn
          icon="message-circle"
          color={colors.mutedForeground}
          label={format(post.commentCount)}
          onPress={() => router.push(`/post/${post.id}` as never)}
        />
        <FooterBtn
          icon="share-2"
          color={colors.mutedForeground}
          label={format(post.shareCount)}
          onPress={() => sharePost(post.id)}
        />
        <FooterBtn
          icon={bookmarked ? "bookmark" : "bookmark"}
          color={bookmarked ? colors.gold : colors.mutedForeground}
          label={bookmarked ? "Saved" : "Save"}
          filled={bookmarked}
          onPress={() => toggleBookmark(post.id)}
        />
      </View>
    </Pressable>
  );
}

function FooterBtn({
  icon,
  color,
  label,
  filled,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  color: string;
  label: string;
  filled?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={(e) => {
        e.stopPropagation?.();
        onPress?.();
      }}
      style={styles.footerBtn}
    >
      <Feather name={icon} size={14} color={color} />
      <Text style={[styles.footerLabel, { color, fontFamily: filled ? "Inter_600SemiBold" : "Inter_500Medium" }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
    overflow: "hidden",
  },
  mediaWrap: {
    height: 200,
    marginTop: 12,
    overflow: "hidden",
  },
  voiceOverlay: {
    position: "absolute",
    left: 14,
    bottom: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  voicePlay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  waveform: {
    flex: 1,
    height: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  wavebar: {
    width: 2,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 2,
  },
  voiceTime: { color: "#fff", fontFamily: "Inter_500Medium", fontSize: 12 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 17 },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
  },
  name: { fontFamily: "Inter_700Bold", fontSize: 14 },
  dot: { fontSize: 12 },
  handle: { fontFamily: "Inter_400Regular", fontSize: 12 },
  kindPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  kindText: { fontSize: 10, fontFamily: "Inter_500Medium", letterSpacing: 0.4, textTransform: "uppercase" },
  body: { fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22 },
  destRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  hashtag: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  pollRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  pollFill: { ...StyleSheet.absoluteFillObject },
  pollLabel: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 13 },
  pollPct: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  pollMeta: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 },
  projectBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  projectHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  projectTitle: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase", flex: 1 },
  projectMeta: { fontFamily: "Inter_500Medium", fontSize: 11 },
  taskRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  taskDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "rgba(245,240,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  taskLabel: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1 },
  nestedLabel: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 4 },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(245,240,255,0.06)",
  },
  footerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  footerLabel: { fontSize: 12 },
});
