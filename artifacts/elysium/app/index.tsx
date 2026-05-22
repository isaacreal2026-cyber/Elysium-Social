import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated as RNAnimated,
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
  { key: "for-you", label: "For You" },
  { key: "following", label: "Following" },
  { key: "voice", label: "Voice" },
  { key: "destiny", label: "Destiny" },
  { key: "near", label: "Near You" },
];

export default function HomeFeed() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { posts, following, unreadNotifications, unreadMessages, voiceRooms } = useResonance();
  const [filter, setFilter] = useState("for-you");
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new RNAnimated.Value(0)).current;

  const liveRoom = voiceRooms.find((v) => v.live);

  const sortedPosts = useMemo(() => {
    const list = [...posts];
    if (filter === "following") {
      const f = list.filter((p) => following[p.authorId]);
      return f.length ? f.sort((a, b) => b.createdAt - a.createdAt) : list.sort((a, b) => b.createdAt - a.createdAt);
    }
    if (filter === "voice") return list.filter((p) => p.kind === "voice" || p.kind === "question").sort((a, b) => b.energy - a.energy);
    if (filter === "destiny") return list.filter((p) => p.kind === "destiny" || p.kind === "media").sort((a, b) => b.energy - a.energy);
    if (filter === "near") return list.sort((a, b) => b.resonance.spark - a.resonance.spark);
    return list.sort((a, b) => b.energy * 1.5 + b.createdAt / 1e10 - (a.energy * 1.5 + a.createdAt / 1e10));
  }, [posts, filter, following]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  const topPad = (Platform.OS === "web" ? Math.max(insets.top, 16) : insets.top) + 8;

  const headerOpacity = scrollY.interpolate({ inputRange: [0, 60], outputRange: [0, 1], extrapolate: "clamp" });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient colors={["#140928", "#07021A"]} style={StyleSheet.absoluteFill} />
      <StarField density={55} seed={42} />

      {/* Scroll-driven sticky header border */}
      <RNAnimated.View
        style={[styles.stickyBorder, { borderBottomColor: colors.border, opacity: headerOpacity }, { pointerEvents: "none" } as any]}
      />

      <FlatList
        data={sortedPosts}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
        onScroll={RNAnimated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <View>
            {/* Top bar */}
            <View style={[styles.topBar, { paddingTop: topPad }]}>
              <Pressable onPress={() => router.push("/orbit" as never)} style={styles.brandRow}>
                <LinearGradient
                  colors={[colors.primary, colors.magenta]}
                  style={styles.brandOrb}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.brandGlyph}>✦</Text>
                </LinearGradient>
                <Text style={[styles.brand, { color: colors.text }]}>Elysium</Text>
              </Pressable>
              <View style={styles.iconsRow}>
                <Pressable
                  onPress={() => router.push("/connections" as never)}
                  style={[styles.iconBtn, { borderColor: colors.border }]}
                >
                  <Feather name="message-circle" size={18} color={colors.text} />
                  {unreadMessages > 0 ? <NotifDot n={unreadMessages} /> : null}
                </Pressable>
                <Pressable
                  onPress={() => router.push("/notifications" as never)}
                  style={[styles.iconBtn, { borderColor: colors.border }]}
                >
                  <Feather name="bell" size={18} color={colors.text} />
                  {unreadNotifications > 0 ? <NotifDot n={unreadNotifications} /> : null}
                </Pressable>
              </View>
            </View>

            {/* Stories */}
            <StoryRail />

            {/* Live voice banner */}
            {liveRoom ? (
              <Pressable
                onPress={() => router.push("/voice-party" as never)}
                style={[styles.liveBanner, { borderColor: colors.rose + "44", backgroundColor: colors.rose + "0C" }]}
              >
                <View style={[styles.livePulse, { backgroundColor: colors.rose }]} />
                <Text style={[styles.liveLabel, { color: colors.rose }]}>LIVE</Text>
                <Text style={[styles.liveText, { color: colors.text }]} numberOfLines={1}>
                  {liveRoom.topic}
                </Text>
                <View style={[styles.liveCount, { backgroundColor: colors.rose + "22" }]}>
                  <Feather name="headphones" size={10} color={colors.rose} />
                  <Text style={[styles.liveCountText, { color: colors.rose }]}>{liveRoom.listeners}</Text>
                </View>
                <Feather name="chevron-right" size={15} color={colors.rose} />
              </Pressable>
            ) : null}

            {/* Feed filters */}
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
                        backgroundColor: active ? colors.primary + "1E" : "rgba(245,240,255,0.03)",
                      },
                    ]}
                  >
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
            <View style={[styles.emptyOrb, { backgroundColor: colors.primary + "22" }]}>
              <Feather name="users" size={26} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>quiet in here</Text>
            <Text style={[styles.emptyMeta, { color: colors.mutedForeground }]}>
              follow people to fill this stream with their signal
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

function NotifDot({ n }: { n: number }) {
  return (
    <View style={[styles.dotBadge, { backgroundColor: "#FB7185" }]}>
      <Text style={styles.dotBadgeText}>{n > 9 ? "9+" : n}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stickyBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 10,
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
  },
  brandGlyph: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14 },
  brand: { fontFamily: "Inter_700Bold", fontSize: 22, letterSpacing: -0.6 },
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
    top: 5,
    right: 5,
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
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  livePulse: { width: 7, height: 7, borderRadius: 3.5 },
  liveLabel: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1 },
  liveText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 13 },
  liveCount: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  liveCountText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  filterRow: { paddingHorizontal: 14, paddingTop: 6, paddingBottom: 12, gap: 8 },
  filter: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterText: { fontFamily: "Inter_600SemiBold", fontSize: 12, letterSpacing: 0.3 },
  empty: { alignItems: "center", paddingTop: 60, paddingHorizontal: 24, gap: 14 },
  emptyOrb: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 20 },
  emptyMeta: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", lineHeight: 20 },
  emptyBtn: { marginTop: 4, paddingHorizontal: 20, paddingVertical: 11, borderRadius: 999 },
  emptyBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
});
