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

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

const KIND_COLORS: Record<Post["kind"], string> = {
  classic: "#A89AC8",
  voice: "#5EEAD4",
  destiny: "#FFD56B",
  project: "#34D399",
  poll: "#B57BFF",
  question: "#F472B6",
  media: "#FB7185",
};

const KIND_LABELS: Record<Post["kind"], string> = {
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

  const bookmarked = isBookmarked(post.id);
  const kindColor = KIND_COLORS[post.kind];

  const cardShadow = Platform.OS === "web"
    ? {} as object
    : { shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } };

  return (
    <Pressable
      onPress={() => router.push(`/post/${post.id}` as never)}
      style={[
        styles.card,
        {
          backgroundColor: nested ? "rgba(245,240,255,0.04)" : colors.card,
          borderColor: nested ? "rgba(245,240,255,0.06)" : colors.border,
          borderRadius: nested ? 16 : colors.radius,
        },
        !nested && cardShadow,
        nested && { marginTop: 10 },
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
          {author?.online ? (
            <View style={[styles.onlineDot, { backgroundColor: colors.emerald, borderColor: colors.card }]} />
          ) : null}
        </Pressable>
        <View style={{ flex: 1, gap: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
            <Text style={[styles.name, { color: colors.text }]}>{author?.name}</Text>
            <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>·</Text>
            <Text style={[styles.time, { color: colors.mutedForeground }]}>{timeAgo(post.createdAt)}</Text>
          </View>
          <Text style={[styles.handle, { color: colors.subtle }]}>{author?.handle} · {author?.city}</Text>
        </View>
        <View style={[styles.kindPill, { borderColor: kindColor + "44", backgroundColor: kindColor + "12" }]}>
          <Text style={[styles.kindText, { color: kindColor }]}>{KIND_LABELS[post.kind]}</Text>
        </View>
      </View>

      <Text style={[styles.body, { color: colors.text }]}>{post.body}</Text>

      {post.destinations && post.destinations.length > 0 ? (
        <View style={styles.destRow}>
          {post.destinations.map((d) => (
            <Pressable key={d} onPress={(e) => { e.stopPropagation?.(); router.push(`/tag/${d}` as never); }}>
              <Text style={[styles.hashtag, { color: colors.gold }]}>#{d}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {post.mediaTone && post.mediaTone !== "none" ? (
        <View style={[styles.mediaWrap, { borderRadius: (colors.radius as number) - 6 }]}>
          <Image source={TONE_IMAGES[post.mediaTone]} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient colors={["transparent", "rgba(7,2,26,0.88)"]} style={StyleSheet.absoluteFill} />
          {post.kind === "voice" ? (
            <View style={styles.voiceOverlay}>
              <View style={[styles.voicePlay, { backgroundColor: colors.teal }]}>
                <Feather name="play" size={14} color="#0E0524" />
              </View>
              <View style={styles.waveform}>
                {Array.from({ length: 28 }).map((_, i) => (
                  <View
                    key={i}
                    style={[styles.wavebar, { height: 5 + Math.abs(Math.sin(i * 0.7)) * 18, backgroundColor: "rgba(255,255,255,0.85)" }]}
                  />
                ))}
              </View>
              <Text style={styles.voiceTime}>0:{String(post.voiceSeconds ?? 0).padStart(2, "0")}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {post.poll ? (
        <View style={styles.pollWrap}>
          {post.poll.options.map((opt, i) => {
            const total = post.poll!.options.reduce((a, b) => a + b.votes, 0);
            const pct = total ? opt.votes / total : 0;
            return (
              <View key={i} style={[styles.pollRow, { borderColor: colors.border }]}>
                <View style={[styles.pollFill, { width: `${pct * 100}%` as any, backgroundColor: colors.primary + "2A" }]} />
                <Text style={[styles.pollLabel, { color: colors.text }]}>{opt.label}</Text>
                <Text style={[styles.pollPct, { color: colors.primary }]}>{Math.round(pct * 100)}%</Text>
              </View>
            );
          })}
          <Text style={[styles.pollMeta, { color: colors.subtle }]}>
            {post.poll.options.reduce((a, b) => a + b.votes, 0).toLocaleString()} votes · 14h left
          </Text>
        </View>
      ) : null}

      {post.project ? (
        <View style={[styles.projectBox, { borderColor: colors.teal + "33", backgroundColor: colors.teal + "09" }]}>
          <View style={styles.projectHeader}>
            <Feather name="layers" size={11} color={colors.teal} />
            <Text style={[styles.projectTitle, { color: colors.teal }]}>Project</Text>
            <Text style={[styles.projectMeta, { color: colors.subtle }]}>
              {post.project.tasks.filter((t) => t.done).length}/{post.project.tasks.length} done
            </Text>
          </View>
          {post.project.tasks.map((t, i) => (
            <View key={i} style={styles.taskRow}>
              <View style={[styles.taskDot, { borderColor: t.done ? colors.teal : colors.border }, t.done && { backgroundColor: colors.teal }]}>
                {t.done ? <Feather name="check" size={9} color="#0E0524" /> : null}
              </View>
              <Text style={[styles.taskLabel, { color: t.done ? colors.subtle : colors.text, textDecorationLine: t.done ? "line-through" : "none" }]}>
                {t.label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {nestedPosts.length > 0 ? (
        <View style={styles.nestedWrap}>
          <View style={[styles.nestedLine, { backgroundColor: colors.border }]} />
          <View style={{ flex: 1 }}>
            {nestedPosts.map((np) => (
              <PostCard key={np.id} post={np} nested />
            ))}
          </View>
        </View>
      ) : null}

      <ResonanceBar postId={post.id} energy={post.energy} />

      <View style={[styles.footerRow, { borderTopColor: colors.border }]}>
        <FooterBtn
          icon="message-circle"
          label={fmt(post.commentCount)}
          onPress={() => router.push(`/post/${post.id}` as never)}
        />
        <FooterBtn
          icon="share-2"
          label={fmt(post.shareCount)}
          onPress={() => sharePost(post.id)}
        />
        <FooterBtn
          icon="bookmark"
          label={bookmarked ? "Saved" : "Save"}
          active={bookmarked}
          activeColor={colors.gold}
          onPress={() => toggleBookmark(post.id)}
        />
      </View>
    </Pressable>
  );
}

function FooterBtn({
  icon, label, active, activeColor, onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  active?: boolean;
  activeColor?: string;
  onPress?: () => void;
}) {
  const colors = useColors();
  const c = active ? (activeColor ?? colors.primary) : colors.mutedForeground;
  return (
    <Pressable
      onPress={(e) => { e.stopPropagation?.(); onPress?.(); }}
      style={styles.footerBtn}
    >
      <Feather name={icon} size={14} color={c} />
      <Text style={[styles.footerLabel, { color: c, fontFamily: active ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  mediaWrap: {
    height: 196,
    marginTop: 12,
    overflow: "hidden",
  },
  voiceOverlay: {
    position: "absolute",
    left: 12,
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  voicePlay: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  waveform: {
    flex: 1,
    height: 26,
    flexDirection: "row",
    alignItems: "center",
    gap: 2.5,
  },
  wavebar: { width: 2, borderRadius: 2 },
  voiceTime: { color: "#fff", fontFamily: "Inter_500Medium", fontSize: 12 },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    flexShrink: 0,
  },
  avatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  name: { fontFamily: "Inter_700Bold", fontSize: 14 },
  time: { fontFamily: "Inter_400Regular", fontSize: 12 },
  handle: { fontFamily: "Inter_400Regular", fontSize: 11 },
  kindPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  kindText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.6, textTransform: "uppercase" },
  body: { fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22 },
  destRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  hashtag: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  pollWrap: { marginTop: 12, gap: 7 },
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
  pollPct: { fontFamily: "Inter_700Bold", fontSize: 12 },
  pollMeta: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 },
  projectBox: {
    marginTop: 12,
    padding: 11,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  projectHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  projectTitle: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase", flex: 1 },
  projectMeta: { fontFamily: "Inter_500Medium", fontSize: 10 },
  taskRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  taskDot: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  taskLabel: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1 },
  nestedWrap: { flexDirection: "row", marginTop: 10, gap: 10 },
  nestedLine: { width: 2, borderRadius: 2, marginLeft: 18 },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
    marginTop: 10,
    borderTopWidth: 1,
  },
  footerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  footerLabel: { fontSize: 12 },
});
