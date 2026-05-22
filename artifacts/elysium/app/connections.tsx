import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "@/components/ScreenShell";
import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";

const TABS = [
  { key: "messages", label: "Messages", icon: "message-circle" as const },
  { key: "voice", label: "Voice Rooms", icon: "mic" as const },
  { key: "graph", label: "Network", icon: "share-2" as const },
  { key: "find", label: "Find People", icon: "user-plus" as const },
];

export default function ConnectionsScreen() {
  const colors = useColors();
  const { threads, voiceRooms, users, userById, selfId } = useResonance();
  const [tab, setTab] = useState<string>("messages");

  return (
    <ScreenShell title="Connections" subtitle="every thread is a tuning fork">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
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
                  backgroundColor: active ? colors.primary + "22" : "rgba(245,240,255,0.04)",
                },
              ]}
            >
              <Feather name={t.icon} size={13} color={active ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.tabText, { color: active ? colors.primary : colors.mutedForeground }]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}>
        {tab === "messages"
          ? threads.map((t) => {
              const otherId = t.participantIds.find((id) => id !== selfId)!;
              const other = userById(otherId);
              return (
                <Pressable
                  key={t.id}
                  onPress={() => router.push(`/messages/${t.id}` as never)}
                  style={[styles.threadRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={[styles.avatar, { backgroundColor: other?.avatarColor }]}>
                    <Text style={styles.avatarText}>{other?.avatarGlyph}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={[styles.threadName, { color: colors.text }]}>{other?.name}</Text>
                      {t.pinned ? <Feather name="bookmark" size={10} color={colors.gold} /> : null}
                      {t.voice ? <Feather name="mic" size={10} color={colors.teal} /> : null}
                    </View>
                    <Text style={[styles.threadMsg, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {t.lastMessage}
                    </Text>
                  </View>
                  {t.unread > 0 ? (
                    <View style={[styles.unread, { backgroundColor: colors.primary }]}>
                      <Text style={styles.unreadText}>{t.unread}</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })
          : null}

        {tab === "voice"
          ? voiceRooms.map((vr) => {
              const host = userById(vr.hostId);
              return (
                <Pressable
                  key={vr.id}
                  onPress={() => router.push("/voice-party" as never)}
                  style={[styles.threadRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={[styles.avatar, { backgroundColor: host?.avatarColor }]}>
                    <Feather name="mic" size={16} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.threadName, { color: colors.text }]} numberOfLines={1}>{vr.topic}</Text>
                    <Text style={[styles.threadMsg, { color: colors.mutedForeground }]}>
                      {vr.live ? "live · " : ""}{vr.listeners} listening · {vr.vibe}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                </Pressable>
              );
            })
          : null}

        {tab === "graph" ? <NetworkGraph /> : null}

        {tab === "find"
          ? users
              .filter((u) => u.id !== selfId)
              .map((u) => (
                <View key={u.id} style={[styles.threadRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.avatar, { backgroundColor: u.avatarColor }]}>
                    <Text style={styles.avatarText}>{u.avatarGlyph}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.threadName, { color: colors.text }]}>{u.name}</Text>
                    <Text style={[styles.threadMsg, { color: colors.mutedForeground }]}>
                      {u.city} · alignment {Math.round(u.alignmentScore * 100)}
                    </Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                      {u.tags.map((t) => (
                        <View key={t} style={[styles.tagPill, { borderColor: colors.border }]}>
                          <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <Pressable style={[styles.followBtn, { borderColor: colors.primary }]}>
                    <Feather name="user-plus" size={14} color={colors.primary} />
                  </Pressable>
                </View>
              ))
          : null}
      </ScrollView>
    </ScreenShell>
  );
}

function NetworkGraph() {
  const colors = useColors();
  const { users, selfId } = useResonance();
  const others = users.filter((u) => u.id !== selfId);
  const center = { x: 50, y: 50 };
  const RADIUS_PCT = 35;
  return (
    <View>
      <View style={[styles.graphBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={[styles.graphLabel, { color: colors.mutedForeground }]}>YOUR RESONANCE GRAPH</Text>
        <View style={styles.graph}>
          {others.map((u, i) => {
            const angle = (Math.PI * 2 * i) / others.length;
            const x = center.x + Math.cos(angle) * RADIUS_PCT;
            const y = center.y + Math.sin(angle) * RADIUS_PCT;
            return (
              <React.Fragment key={u.id}>
                <View
                  style={[
                    styles.graphLine,
                    {
                      backgroundColor: colors.primary + "55",
                      transform: [
                        { translateX: 0 },
                        { translateY: 0 },
                        { rotate: `${angle * (180 / Math.PI)}deg` },
                      ],
                      width: `${RADIUS_PCT}%`,
                      opacity: u.alignmentScore,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.graphNode,
                    {
                      left: `${x}%`,
                      top: `${y}%`,
                      backgroundColor: u.avatarColor,
                    },
                  ]}
                >
                  <Text style={styles.graphNodeText}>{u.avatarGlyph}</Text>
                </View>
              </React.Fragment>
            );
          })}
          <View style={[styles.graphSelf, { backgroundColor: colors.primary }]}>
            <Text style={styles.graphSelfText}>You</Text>
          </View>
        </View>
        <Text style={[styles.graphHelp, { color: colors.mutedForeground }]}>
          line strength reflects alignment over the last 30 days
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  tabText: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },
  threadRow: {
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },
  threadName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  threadMsg: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  unread: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 11 },
  tagPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  tagText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  followBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  graphBox: { padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 16 },
  graphLabel: { fontFamily: "Inter_600SemiBold", fontSize: 10, letterSpacing: 1, marginBottom: 12 },
  graph: { width: "100%", aspectRatio: 1, position: "relative", alignItems: "center", justifyContent: "center" },
  graphLine: {
    position: "absolute",
    height: 1,
    left: "50%",
    top: "50%",
    transformOrigin: "left center",
  },
  graphNode: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: -18,
    marginTop: -18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0E0524",
  },
  graphNodeText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
  graphSelf: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  graphSelfText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
  graphHelp: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 12, textAlign: "center" },
});
