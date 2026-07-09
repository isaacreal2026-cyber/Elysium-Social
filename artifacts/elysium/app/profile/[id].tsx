import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomTabBar } from "@/components/BottomTabBar";
import { PostCard } from "@/components/PostCard";
import { StarField } from "@/components/StarField";
import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";

const TONES = [
  require("@/assets/images/nebula1.png"),
  require("@/assets/images/nebula2.png"),
  require("@/assets/images/nebula3.png"),
];

const TABS: {
  key: "moments" | "voice" | "hubs" | "saved";
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
}[] = [
  { key: "moments", label: "Moments", icon: "feather" },
  { key: "voice", label: "Voice", icon: "mic" },
  { key: "hubs", label: "Hubs", icon: "hexagon" },
  { key: "saved", label: "Saved", icon: "bookmark" },
];

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    users,
    posts,
    hubs,
    isFollowing,
    toggleFollow,
    selfId,
    threads,
    bookmarks,
  } = useResonance();
  const user = users.find((u) => u.id === id);
  const [tab, setTab] = useState<"moments" | "voice" | "hubs" | "saved">(
    "moments",
  );

  const isMe = id === selfId;

  if (!user) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, padding: 24 }}>
          This soul has drifted away.
        </Text>
      </View>
    );
  }

  const userPosts = posts.filter((p) => p.authorId === user.id);
  const voicePosts = userPosts.filter((p) => p.kind === "voice");
  const userHubs = hubs.filter((h) => h.online.includes(user.id));
  const savedPosts = posts.filter((p) => bookmarks[p.id]);

  const showPosts =
    tab === "moments"
      ? userPosts
      : tab === "voice"
        ? voicePosts
        : tab === "saved"
          ? savedPosts
          : [];

  const following = isFollowing(user.id);
  const tone = (user.id.charCodeAt(2) || 0) % 3;

  const isWeb = Platform.OS === "web";
  const topPad = (isWeb ? Math.max(insets.top, 16) : insets.top) + 8;

  const startThread = () => {
    const existing = threads.find((t) => t.participantIds.includes(user.id));
    if (existing) router.push(`/messages/${existing.id}` as never);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#150A2E", "#07021A"]}
        style={StyleSheet.absoluteFill}
      />
      <StarField density={50} seed={user.id.charCodeAt(0)} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        <View style={[styles.coverWrap, { paddingTop: topPad }]}>
          <View style={styles.cover}>
            <Image
              source={TONES[tone]}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
            <LinearGradient
              colors={["rgba(7,2,26,0.2)", "rgba(7,2,26,0.95)"]}
              style={StyleSheet.absoluteFill}
            />
          </View>
          <View style={styles.coverNav}>
            <Pressable
              onPress={() => router.back()}
              style={[styles.iconBtn, { backgroundColor: "rgba(7,2,26,0.6)" }]}
            >
              <Feather name="chevron-left" size={20} color="#fff" />
            </Pressable>
            <Pressable
              style={[styles.iconBtn, { backgroundColor: "rgba(7,2,26,0.6)" }]}
            >
              <Feather name="more-horizontal" size={20} color="#fff" />
            </Pressable>
          </View>
        </View>

        <View style={styles.profileBody}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: user.avatarColor,
                borderColor: colors.background,
              },
            ]}
          >
            <Text style={styles.avatarText}>{user.avatarGlyph}</Text>
            {user.online ? (
              <View
                style={[
                  styles.onlineDot,
                  {
                    backgroundColor: colors.emerald,
                    borderColor: colors.background,
                  },
                ]}
              />
            ) : null}
          </View>

          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.text }]}>
                {user.name}
              </Text>
              <Text style={[styles.handle, { color: colors.mutedForeground }]}>
                {user.handle} · {user.city}
              </Text>
            </View>
            {!isMe ? (
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable
                  onPress={startThread}
                  style={[
                    styles.actionBtn,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                    },
                  ]}
                >
                  <Feather
                    name="message-circle"
                    size={16}
                    color={colors.text}
                  />
                </Pressable>
                <Pressable
                  onPress={() => toggleFollow(user.id)}
                  style={[
                    styles.followBtn,
                    {
                      backgroundColor: following
                        ? "transparent"
                        : colors.primary,
                      borderColor: following ? colors.border : colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.followText,
                      { color: following ? colors.text : "#fff" },
                    ]}
                  >
                    {following ? "Following" : "Follow"}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => router.push("/composer" as never)}
                style={[
                  styles.actionBtn,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
              >
                <Feather name="edit-2" size={16} color={colors.text} />
              </Pressable>
            )}
          </View>

          <Text style={[styles.bio, { color: colors.text }]}>{user.bio}</Text>

          <View style={styles.voiceIntro}>
            <View style={[styles.voicePlay, { backgroundColor: colors.gold }]}>
              <Feather name="play" size={12} color="#0E0524" />
            </View>
            <View style={styles.miniWave}>
              {Array.from({ length: 18 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.miniBar,
                    {
                      height: 4 + Math.abs(Math.sin(i * 0.6)) * 14,
                      backgroundColor: colors.gold,
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.voiceMeta, { color: colors.gold }]}>
              intro · {user.introVoiceSeconds}s
            </Text>
          </View>

          <View style={styles.statsRow}>
            <Stat label="followers" value={user.followers} />
            <Stat label="following" value={user.following} />
            <Stat
              label="alignment"
              value={`${Math.round(user.alignmentScore * 100)}`}
            />
            <Stat label="visitors / wk" value={user.weeklyVisitors} />
          </View>

          <View style={styles.tagRow}>
            {user.tags.map((t) => (
              <View
                key={t}
                style={[
                  styles.tagChip,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.primary + "11",
                  },
                ]}
              >
                <Text style={[styles.tagChipText, { color: colors.primary }]}>
                  {t}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.destRow}>
            {user.destinations.map((d) => (
              <Pressable
                key={d}
                onPress={() => router.push(`/tag/${d}` as never)}
                style={[styles.destChip, { borderColor: colors.gold + "55" }]}
              >
                <Feather name="navigation" size={11} color={colors.gold} />
                <Text style={[styles.destChipText, { color: colors.gold }]}>
                  {d}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.tabRow, { borderColor: colors.border }]}>
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                style={[
                  styles.tab,
                  active && { borderBottomColor: colors.primary },
                ]}
              >
                <Feather
                  name={t.icon}
                  size={16}
                  color={active ? colors.primary : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.tabText,
                    { color: active ? colors.primary : colors.mutedForeground },
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          {tab === "hubs" ? (
            userHubs.length === 0 ? (
              <Empty text="not orbiting any hub yet" />
            ) : (
              userHubs.map((h) => (
                <Pressable
                  key={h.id}
                  onPress={() => router.push(`/hub/${h.id}` as never)}
                  style={[
                    styles.hubChip,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.hubGlyph,
                      { backgroundColor: colors.primary + "22" },
                    ]}
                  >
                    <Feather name="hexagon" size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.hName, { color: colors.text }]}>
                      {h.name}
                    </Text>
                    <Text
                      style={[styles.hTag, { color: colors.mutedForeground }]}
                      numberOfLines={1}
                    >
                      {h.tagline}
                    </Text>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={16}
                    color={colors.mutedForeground}
                  />
                </Pressable>
              ))
            )
          ) : showPosts.length === 0 ? (
            <Empty
              text={
                tab === "saved"
                  ? "nothing saved yet"
                  : tab === "voice"
                    ? "no voice notes yet"
                    : "no moments yet"
              }
            />
          ) : (
            showPosts.map((p) => <PostCard key={p.id} post={p} />)
          )}
        </View>
      </ScrollView>
      <BottomTabBar />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  const colors = useColors();
  const display =
    typeof value === "number" && value >= 1000
      ? `${(value / 1000).toFixed(1)}k`
      : value;
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: colors.text }]}>{display}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

function Empty({ text }: { text: string }) {
  const colors = useColors();
  return (
    <View style={[styles.empty, { borderColor: colors.border }]}>
      <Feather name="cloud" size={22} color={colors.mutedForeground} />
      <Text
        style={{
          color: colors.mutedForeground,
          fontFamily: "Inter_500Medium",
          fontSize: 13,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  coverWrap: { position: "relative" },
  cover: { height: 200, marginHorizontal: 0 },
  coverNav: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  profileBody: { paddingHorizontal: 16, marginTop: -42 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
  },
  avatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 32 },
  onlineDot: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 12,
  },
  name: { fontFamily: "Inter_700Bold", fontSize: 22, letterSpacing: -0.5 },
  handle: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  followBtn: {
    paddingHorizontal: 18,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  followText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  bio: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  voiceIntro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,213,107,0.08)",
    alignSelf: "flex-start",
  },
  voicePlay: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  miniWave: { flexDirection: "row", alignItems: "center", gap: 2, height: 18 },
  miniBar: { width: 2, borderRadius: 2 },
  voiceMeta: { fontFamily: "Inter_700Bold", fontSize: 11 },
  statsRow: { flexDirection: "row", gap: 14, marginTop: 14 },
  stat: { flex: 1 },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 16 },
  statLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 14 },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  tagChipText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  destRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  destChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  destChipText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  tabRow: {
    flexDirection: "row",
    marginTop: 18,
    marginHorizontal: 16,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 4,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    flexDirection: "row",
  },
  tabText: { fontFamily: "Inter_600SemiBold", fontSize: 12, marginLeft: 4 },
  hubChip: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  hubGlyph: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  hName: { fontFamily: "Inter_700Bold", fontSize: 14 },
  hTag: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  empty: {
    marginTop: 16,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    gap: 8,
  },
});
