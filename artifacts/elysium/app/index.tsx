import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomTabBar } from "@/components/BottomTabBar";
import { PostCard } from "@/components/PostCard";
import { StarField } from "@/components/StarField";
import { StoryRail } from "@/components/StoryRail";
import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";

const FILTERS = [
  { key: "for-you", label: "For You", icon: "star" as const },
  { key: "following", label: "Following", icon: "users" as const },
  { key: "voice", label: "Voice", icon: "mic" as const },
  { key: "destiny", label: "Destiny", icon: "navigation" as const },
  { key: "near", label: "Near You", icon: "map-pin" as const },
];

export default function HomeFeed() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { posts, following, unreadNotifications, unreadMessages, voiceRooms } = useResonance();
  const [filter, setFilter] = useState("for-you");
  const [refreshing, setRefreshing] = useState(false);

  const liveRoom = voiceRooms.find((v) => v.live);

  const sortedPosts = useMemo(() => {
    const list = [...posts];
    if (filter === "following") {
      return list.filter((p) => following[p.authorId]).sort((a, b) => b.createdAt - a.createdAt);
    }
    if (filter === "voice") return list.filter((p) => p.kind === "voice").sort((a, b) => b.energy - a.energy);
    if (filter === "destiny") return list.filter((p) => p.kind === "destiny").sort((a, b) => b.energy - a.energy);
    if (filter === "near") return list.sort((a, b) => b.resonance.spark - a.resonance.spark);
    return list.sort((a, b) => b.energy * 2 + b.createdAt / 1e10 - (a.energy * 2 + a.createdAt / 1e10));
  }, [posts, filter, following]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const isWeb = Platform.OS === "web";
  const topPad = (isWeb ? Math.max(insets.top, 16) : insets.top) + 8;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient colors={["#150A2E", "#07021A"]} style={StyleSheet.absoluteFill} />
      <StarField density={70} seed={11} />

      <FlatList
        data={sortedPosts}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={[styles.topBar, { paddingTop: topPad }]}>
              <View style={styles.brandRow}>
                <View style={[styles.brandOrb, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
                  <Text style={styles.brandGlyph}>✦</Text>
                </View>
                <Text style={[styles.brand, { color: colors.text }]}>Elysium</Text>
              </View>
              <View style={styles.iconsRow}>
                <Pressable
                  onPress={() => router.push("/orbit" as never)}
                  style={[styles.iconBtn, { borderColor: colors.border }]}
                >
                  <Feather name="grid" size={18} color={colors.text} />
                </Pressable>
                <Pressable
                  onPress={() => router.push("/connections" as never)}
                  style={[styles.iconBtn, { borderColor: colors.border }]}
                >
                  <Feather name="message-circle" size={18} color={colors.text} />
                  {unreadMessages > 0 ? (
                    <View style={[styles.dotBadge, { backgroundColor: colors.rose }]}>
                      <Text style={styles.dotBadgeText}>{unreadMessages}</Text>
                    </View>
                  ) : null}
                </Pressable>
                <Pressable
                  onPress={() => router.push("/notifications" as never)}
                  style={[styles.iconBtn, { borderColor: colors.border }]}
                >
                  <Feather name="bell" size={18} color={colors.text} />
                  {unreadNotifications > 0 ? (
                    <View style={[styles.dotBadge, { backgroundColor: colors.rose }]}>
                      <Text style={styles.dotBadgeText}>{unreadNotifications}</Text>
                    </View>
                  ) : null}
                </Pressable>
              </View>
            </View>

            <StoryRail />

            {liveRoom ? (
              <Pressable
                onPress={() => router.push("/voice-party" as never)}
                style={[styles.liveBanner, { borderColor: colors.rose + "55" }]}
              >
                <LinearGradient
                  colors={[colors.rose + "44", "transparent"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={[styles.liveDot, { backgroundColor: colors.rose }]} />
                <Text style={[styles.liveText, { color: colors.text }]} numberOfLines={1}>
                  <Text style={{ color: colors.rose, fontFamily: "Inter_700Bold" }}>LIVE</Text>
                  <Text style={{ color: colors.mutedForeground }}>  ·  </Text>
                  {liveRoom.topic}
                </Text>
                <Text style={[styles.liveMeta, { color: colors.mutedForeground }]}>
                  {liveRoom.listeners}
                </Text>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </Pressable>
            ) : null}

            <FlatList
              horizontal
              data={FILTERS}
              keyExtractor={(f) => f.key}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
              renderItem={({ item }) => {
                const active = filter === item.key;
                return (
                  <Pressable
                    onPress={() => setFilter(item.key)}
                    style={[
                      styles.filter,
                      {
                        borderColor: active ? colors.primary : colors.border,
                        backgroundColor: active ? colors.primary + "22" : "rgba(245,240,255,0.04)",
                      },
                    ]}
                  >
                    <Feather name={item.icon} size={12} color={active ? colors.primary : colors.mutedForeground} />
                    <Text style={[styles.filterText, { color: active ? colors.primary : colors.mutedForeground }]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="users" size={28} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>quiet here</Text>
            <Text style={[styles.emptyMeta, { color: colors.mutedForeground }]}>
              follow a few people to fill this stream
            </Text>
            <Pressable
              onPress={() => router.push("/search" as never)}
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.emptyBtnText}>find people</Text>
            </Pressable>
          </View>
        }
      />
      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandOrb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.7,
    shadowRadius: 12,
  },
  brandGlyph: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14 },
  brand: { fontFamily: "Inter_700Bold", fontSize: 22, letterSpacing: -0.5 },
  iconsRow: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(245,240,255,0.04)",
    position: "relative",
  },
  dotBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  dotBadgeText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 9 },
  liveBanner: {
    marginHorizontal: 14,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    overflow: "hidden",
  },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 13 },
  liveMeta: { fontFamily: "Inter_500Medium", fontSize: 12 },
  filterRow: { paddingHorizontal: 14, paddingTop: 4, paddingBottom: 12, gap: 8 },
  filter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterText: { fontFamily: "Inter_600SemiBold", fontSize: 12, letterSpacing: 0.3 },
  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 24, gap: 12 },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  emptyMeta: { fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center" },
  emptyBtn: { marginTop: 8, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999 },
  emptyBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
});
