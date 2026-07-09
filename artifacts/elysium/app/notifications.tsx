import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "@/components/ScreenShell";
import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";
import type { ElysiumNotification, NotificationKind } from "@/lib/types";

const TABS: { key: "all" | "mentions" | "follows"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "mentions", label: "Mentions" },
  { key: "follows", label: "Follows" },
];

const KIND_ICON: Record<
  NotificationKind,
  React.ComponentProps<typeof Feather>["name"]
> = {
  resonance: "zap",
  comment: "message-circle",
  follow: "user-plus",
  mention: "at-sign",
  hub_invite: "hexagon",
  voice_live: "mic",
  story_view: "eye",
};

const KIND_COLOR: Record<NotificationKind, string> = {
  resonance: "#FFD56B",
  comment: "#5EEAD4",
  follow: "#B57BFF",
  mention: "#F472B6",
  hub_invite: "#34D399",
  voice_live: "#FB7185",
  story_view: "#A89AC8",
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

function groupBySection(items: ElysiumNotification[]) {
  const today: ElysiumNotification[] = [];
  const earlier: ElysiumNotification[] = [];
  const day = 24 * 60 * 60 * 1000;
  items.forEach((n) => {
    if (Date.now() - n.createdAt < day) today.push(n);
    else earlier.push(n);
  });
  return { today, earlier };
}

export default function NotificationsScreen() {
  const colors = useColors();
  const {
    notifications,
    userById,
    markAllNotificationsRead,
    isFollowing,
    toggleFollow,
  } = useResonance();
  const [tab, setTab] = useState<"all" | "mentions" | "follows">("all");

  useEffect(() => {
    const t = setTimeout(() => markAllNotificationsRead(), 800);
    return () => clearTimeout(t);
  }, [markAllNotificationsRead]);

  const filtered = useMemo(() => {
    if (tab === "mentions")
      return notifications.filter(
        (n) => n.kind === "mention" || n.kind === "comment",
      );
    if (tab === "follows")
      return notifications.filter((n) => n.kind === "follow");
    return notifications;
  }, [notifications, tab]);

  const { today, earlier } = useMemo(
    () => groupBySection(filtered),
    [filtered],
  );

  return (
    <ScreenShell title="Activity" subtitle="resonance from across the cosmos">
      <View style={styles.tabRow}>
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[
                styles.tab,
                {
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active
                    ? colors.primary + "22"
                    : "rgba(245,240,255,0.04)",
                },
              ]}
            >
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

      <FlatList
        data={[
          ...(today.length
            ? [{ kind: "section" as const, label: "Today" }]
            : []),
          ...today.map((n) => ({ kind: "item" as const, n })),
          ...(earlier.length
            ? [{ kind: "section" as const, label: "Earlier" }]
            : []),
          ...earlier.map((n) => ({ kind: "item" as const, n })),
        ]}
        keyExtractor={(item, i) =>
          item.kind === "section" ? `s-${i}-${item.label}` : item.n.id
        }
        contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 120 }}
        renderItem={({ item }) => {
          if (item.kind === "section") {
            return (
              <Text style={[styles.section, { color: colors.mutedForeground }]}>
                {item.label.toUpperCase()}
              </Text>
            );
          }
          const n = item.n;
          const actor = userById(n.actorId);
          const onPress = () => {
            if (n.postId) router.push(`/post/${n.postId}` as never);
            else if (n.hubId) router.push(`/hub/${n.hubId}` as never);
            else if (n.voiceRoomId) router.push("/voice-party" as never);
            else if (n.kind === "follow" && actor)
              router.push(`/profile/${actor.id}` as never);
          };
          const following = isFollowing(n.actorId);
          return (
            <Pressable
              onPress={onPress}
              style={[
                styles.row,
                {
                  borderColor: colors.border,
                  backgroundColor: n.read
                    ? "transparent"
                    : colors.primary + "0F",
                },
              ]}
            >
              <View style={{ position: "relative" }}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: actor?.avatarColor },
                  ]}
                >
                  <Text style={styles.avatarText}>{actor?.avatarGlyph}</Text>
                </View>
                <View
                  style={[
                    styles.iconBadge,
                    { backgroundColor: KIND_COLOR[n.kind] },
                  ]}
                >
                  <Feather name={KIND_ICON[n.kind]} size={10} color="#0E0524" />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowText, { color: colors.text }]}>
                  <Text style={{ fontFamily: "Inter_700Bold" }}>
                    {actor?.name}
                  </Text>{" "}
                  <Text style={{ color: colors.mutedForeground }}>
                    {n.body}
                  </Text>
                </Text>
                <Text
                  style={[styles.rowTime, { color: colors.mutedForeground }]}
                >
                  {timeAgo(n.createdAt)}
                </Text>
              </View>
              {n.kind === "follow" ? (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation?.();
                    if (actor) toggleFollow(actor.id);
                  }}
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
              ) : !n.read ? (
                <View
                  style={[
                    styles.unreadDot,
                    { backgroundColor: colors.primary },
                  ]}
                />
              ) : null}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="bell" size={28} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              nothing new — yet
            </Text>
          </View>
        }
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  tabText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.3,
  },
  section: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1.2,
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  row: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 15 },
  iconBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0E0524",
  },
  rowText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  rowTime: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 4 },
  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  followText: { fontFamily: "Inter_700Bold", fontSize: 12 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  empty: { paddingTop: 80, alignItems: "center", gap: 10 },
  emptyText: { fontFamily: "Inter_500Medium", fontSize: 14 },
});
