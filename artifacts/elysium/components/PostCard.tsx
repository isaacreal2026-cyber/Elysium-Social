import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
  const { userById, posts } = useResonance();
  const author = userById(post.authorId);
  const nestedPosts = (post.nestedPostIds ?? [])
    .map((id) => posts.find((p) => p.id === id))
    .filter(Boolean) as Post[];

  const cardBg = nested ? "rgba(245,240,255,0.04)" : colors.card;
  const borderColor = nested ? "rgba(245,240,255,0.06)" : colors.border;

  return (
    <Pressable
      onPress={() => router.push(`/post/${post.id}` as never)}
      style={[
        styles.card,
        { backgroundColor: cardBg, borderColor, borderRadius: colors.radius },
        nested && { marginTop: 12 },
      ]}
    >
      {post.mediaTone && post.mediaTone !== "none" ? (
        <View style={[styles.mediaWrap, { borderRadius: colors.radius - 6 }]}>
          <Image source={TONE_IMAGES[post.mediaTone]} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient
            colors={["transparent", "rgba(7,2,26,0.85)"]}
            style={StyleSheet.absoluteFill}
          />
          {post.kind === "voice" ? (
            <View style={styles.voiceOverlay}>
              <Feather name="play" size={20} color="#fff" />
              <View style={styles.waveform}>
                {Array.from({ length: 22 }).map((_, i) => (
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

      <View style={styles.headerRow}>
        <View style={[styles.avatar, { backgroundColor: author?.avatarColor ?? colors.primary }]}>
          <Text style={styles.avatarText}>{author?.avatarGlyph ?? "?"}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.text }]}>{author?.name}</Text>
          <Text style={[styles.handle, { color: colors.mutedForeground }]}>
            {author?.handle} · {timeAgo(post.createdAt)}
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
            <View key={d} style={[styles.destPill, { borderColor }]}>
              <Feather name="navigation" size={10} color={colors.gold} />
              <Text style={[styles.destText, { color: colors.gold }]}>{d}</Text>
            </View>
          ))}
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
        </View>
      ) : null}

      {post.project ? (
        <View style={[styles.projectBox, { borderColor }]}>
          <View style={styles.projectHeader}>
            <Feather name="layers" size={12} color={colors.teal} />
            <Text style={[styles.projectTitle, { color: colors.teal }]}>Project Mode</Text>
          </View>
          {post.project.tasks.map((t, i) => (
            <View key={i} style={styles.taskRow}>
              <View style={[styles.taskDot, t.done && { backgroundColor: colors.teal, borderColor: colors.teal }]} />
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
    marginBottom: 14,
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
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  name: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  handle: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 1 },
  kindPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  kindText: { fontSize: 10, fontFamily: "Inter_500Medium", letterSpacing: 0.4, textTransform: "uppercase" },
  body: { fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22 },
  destRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  destPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  destText: { fontSize: 11, fontFamily: "Inter_500Medium" },
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
  projectBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  projectHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  projectTitle: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase" },
  taskRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  taskDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "rgba(245,240,255,0.3)",
  },
  taskLabel: { fontFamily: "Inter_400Regular", fontSize: 13 },
  nestedLabel: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 4 },
});
