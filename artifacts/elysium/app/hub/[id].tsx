import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { PostCard } from "@/components/PostCard";
import { ScreenShell } from "@/components/ScreenShell";
import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";

const NEBULAS = [
  require("@/assets/images/nebula1.png"),
  require("@/assets/images/nebula2.png"),
  require("@/assets/images/nebula3.png"),
];

const TABS = [
  { key: "feed", label: "Feed", icon: "feather" as const },
  { key: "members", label: "Members", icon: "users" as const },
  { key: "voice", label: "Voice", icon: "mic" as const },
  { key: "tasks", label: "Tasks", icon: "layers" as const },
  { key: "chat", label: "Chat", icon: "message-circle" as const },
];

export default function HubDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { hubs, posts, userById, toggleHubProjectMode, voiceRooms, threads, chats, sendMessage, addPost, selfId } = useResonance();
  const hub = hubs.find((h) => h.id === id);
  const [tab, setTab] = useState("feed");
  const [chatInput, setChatInput] = useState("");

  if (!hub) {
    return (
      <ScreenShell title="Hub not found" subtitle="this hub drifted away">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.text }}>
            This hub has drifted into the void.
          </Text>
        </View>
      </ScreenShell>
    );
  }

  const hubPosts = posts.filter((p) => hub.postIds.includes(p.id));
  const hubVoiceRooms = voiceRooms.filter((vr) => vr.live);
  const onlineMembers = hub.online.map((uid) => userById(uid)).filter(Boolean);
  const allMembers = hub.online.slice(0, 20); // Simulated full member list

  const handleSendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    // Find or create a thread for this hub
    const hubThreadId = `t-hub-${hub.id}`;
    sendMessage(hubThreadId, chatInput.trim());
    setChatInput("");
  }, [chatInput, hub.id, sendMessage]);

  const handleCreatePost = useCallback(() => {
    const postId = addPost({
      body: `New post in ${hub.name}`,
      kind: "classic",
      destinations: [hub.name],
    });
    // In a real app, this would add the post to hub.postIds
  }, [addPost, hub.name]);

  return (
    <ScreenShell
      title={hub.name}
      subtitle={hub.tagline}
      rightAction={
        <Pressable
          onPress={() => toggleHubProjectMode(hub.id)}
          style={[
            styles.modeBtn,
            { borderColor: hub.projectMode ? colors.teal : colors.border },
          ]}
          accessibilityLabel={hub.projectMode ? "Switch to social mode" : "Switch to project mode"}
          accessibilityRole="button"
        >
          <Feather
            name="layers"
            size={14}
            color={hub.projectMode ? colors.teal : colors.mutedForeground}
          />
        </Pressable>
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* Spatial visualization */}
        <View style={styles.spatial} accessibilityLabel={`${hub.name} hub visualization with ${hub.online.length} members online`}>
          <Image
            source={NEBULAS[hub.toneIndex]}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <LinearGradient
            colors={[`rgba(7,2,26,0.4)`, `rgba(7,2,26,0.95)`]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.orbiters}>
            {hub.online.slice(0, 6).map((uid, i) => {
              const u = userById(uid);
              if (!u) return null;
              return (
                <Orbiter
                  key={uid}
                  color={u.avatarColor}
                  glyph={u.avatarGlyph}
                  index={i}
                  total={hub.online.length}
                />
              );
            })}
            <View style={[styles.center, { borderColor: colors.gold }]}>
              <Text style={styles.centerText}>
                {Math.round(hub.pulse * 100)}
              </Text>
              <Text style={styles.centerLabel}>PULSE</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.windowsRow]}>
          <Window
            label="Members"
            value={formatCount(hub.members)}
            color={colors.primary}
          />
          <Window
            label="Voice"
            value={`${hubVoiceRooms.length} live`}
            color={colors.teal}
          />
          <Window
            label="Pulse"
            value={`${Math.round(hub.pulse * 100)}%`}
            color={colors.gold}
          />
        </View>

        {/* Project mode banner */}
        {hub.projectMode ? (
          <View
            style={[
              styles.projectBanner,
              { borderColor: colors.teal, backgroundColor: colors.teal + "11" },
            ]}
          >
            <Feather name="layers" size={14} color={colors.teal} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.projectTitle, { color: colors.teal }]}>
                PROJECT MODE — collaborative canvas
              </Text>
              <Text style={[styles.projectMeta, { color: colors.mutedForeground }]}>
                shared moodboard · tasks open · voice notes pinned
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.teal} />
          </View>
        ) : null}

        {/* Tab row */}
        <View style={styles.tabRow}>
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <Pressable
                key={t.key}
                onPress={() => {
                  setTab(t.key);
                  AccessibilityInfo.announceForAccessibility(`Showing ${t.label}`);
                }}
                style={[
                  styles.tab,
                  {
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active ? colors.primary + "22" : "rgba(245,240,255,0.04)",
                  },
                ]}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t.label}
              >
                <Feather
                  name={t.icon}
                  size={13}
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

        {/* Tab content */}
        <View style={{ paddingHorizontal: 16 }}>
          {tab === "feed" && (
            <>
              <Pressable
                onPress={() => router.push("/composer" as never)}
                style={[styles.composeBtn, { backgroundColor: colors.primary }]}
                accessibilityLabel="Create post in this hub"
              >
                <Feather name="plus" size={16} color="#fff" />
                <Text style={styles.composeBtnText}>Create post</Text>
              </Pressable>
              {hubPosts.length > 0 ? (
                hubPosts.map((p) => <PostCard key={p.id} post={p} />)
              ) : (
                <EmptyState
                  icon="feather"
                  text="no posts yet — start the conversation"
                  colors={colors}
                />
              )}
            </>
          )}

          {tab === "members" && (
            <View style={{ gap: 10 }}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                ONLINE NOW · {onlineMembers.length}
              </Text>
              {onlineMembers.map((u) => (
                <Pressable
                  key={u!.id}
                  onPress={() => router.push(`/profile/${u!.id}` as never)}
                  style={[styles.memberRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                  accessibilityLabel={`${u!.name}, ${u!.city}`}
                >
                  <View style={[styles.memberAvatar, { backgroundColor: u!.avatarColor }]}>
                    <Text style={styles.memberAvatarText}>{u!.avatarGlyph}</Text>
                    <View style={[styles.memberOnlineDot, { backgroundColor: colors.emerald }]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.memberName, { color: colors.text }]}>{u!.name}</Text>
                    <Text style={[styles.memberBio, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {u!.bio}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 4 }}>
                    {u!.tags.slice(0, 2).map((t) => (
                      <View key={t} style={[styles.miniTag, { borderColor: colors.border }]}>
                        <Text style={[styles.miniTagText, { color: colors.mutedForeground }]}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </Pressable>
              ))}
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 16 }]}>
                ALL MEMBERS · {formatCount(hub.members)}
              </Text>
              <Text style={[styles.allMembersNote, { color: colors.subtle }]}>
                {formatCount(hub.members)} people have tuned into this hub. The Resonance Engine
                surfaces the ones whose energy aligns with yours.
              </Text>
            </View>
          )}

          {tab === "voice" && (
            <View style={{ gap: 10 }}>
              <Pressable
                onPress={() => router.push("/voice-party" as never)}
                style={[styles.createRoomBtn, { borderColor: colors.teal + "55", backgroundColor: colors.teal + "12" }]}
                accessibilityLabel="Start a voice room"
              >
                <Feather name="mic" size={16} color={colors.teal} />
                <Text style={[styles.createRoomBtnText, { color: colors.teal }]}>Start a voice room</Text>
              </Pressable>
              {hubVoiceRooms.length > 0 ? (
                hubVoiceRooms.map((vr) => {
                  const host = userById(vr.hostId);
                  return (
                    <Pressable
                      key={vr.id}
                      onPress={() => router.push("/voice-party" as never)}
                      style={[styles.voiceRoomRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                      accessibilityLabel={`${vr.topic}, ${vr.listeners} listening, ${vr.vibe} vibe`}
                    >
                      <View style={[styles.liveDot, { backgroundColor: colors.rose }]}>
                        <View style={[styles.liveDotInner, { backgroundColor: colors.rose }]} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.voiceRoomTopic, { color: colors.text }]} numberOfLines={1}>
                          {vr.topic}
                        </Text>
                        <Text style={[styles.voiceRoomMeta, { color: colors.mutedForeground }]}>
                          {vr.listeners} listening · {vr.vibe} · hosted by {host?.name}
                        </Text>
                      </View>
                      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                    </Pressable>
                  );
                })
              ) : (
                <EmptyState
                  icon="mic"
                  text="no voice rooms live right now — start one"
                  colors={colors}
                />
              )}
              {/* Show scheduled rooms */}
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 16 }]}>
                RECENT ROOMS
              </Text>
              {voiceRooms.filter((vr) => !vr.live).map((vr) => (
                <View
                  key={vr.id}
                  style={[styles.voiceRoomRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={[styles.offlineDot, { backgroundColor: colors.subtle }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.voiceRoomTopic, { color: colors.text }]} numberOfLines={1}>
                      {vr.topic}
                    </Text>
                    <Text style={[styles.voiceRoomMeta, { color: colors.subtle }]}>
                      ended · {vr.listeners} listeners
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {tab === "tasks" && (
            <View style={{ gap: 12 }}>
              {hub.projectMode ? (
                <>
                  {/* Find project posts */}
                  {hubPosts.filter((p) => p.kind === "project" && p.project).map((p) => (
                    <View key={p.id} style={[styles.taskSection, { borderColor: colors.teal + "33", backgroundColor: colors.teal + "09" }]}>
                      <View style={styles.taskSectionHeader}>
                        <Feather name="layers" size={12} color={colors.teal} />
                        <Text style={[styles.taskSectionTitle, { color: colors.teal }]}>
                          {p.body.slice(0, 50)}
                        </Text>
                      </View>
                      {p.project!.tasks.map((t, i) => (
                        <View key={i} style={styles.taskItem}>
                          <View
                            style={[
                              styles.taskDot,
                              { borderColor: t.done ? colors.teal : colors.border },
                              t.done && { backgroundColor: colors.teal },
                            ]}
                          >
                            {t.done ? <Feather name="check" size={9} color="#0E0524" /> : null}
                          </View>
                          <Text
                            style={[
                              styles.taskLabel,
                              {
                                color: t.done ? colors.subtle : colors.text,
                                textDecorationLine: t.done ? "line-through" : "none",
                              },
                            ]}
                          >
                            {t.label}
                          </Text>
                        </View>
                      ))}
                      <Text style={[styles.taskProgress, { color: colors.mutedForeground }]}>
                        {p.project!.tasks.filter((t) => t.done).length}/{p.project!.tasks.length} completed
                      </Text>
                    </View>
                  ))}
                  <Pressable
                    onPress={() => router.push("/composer" as never)}
                    style={[styles.composeBtn, { backgroundColor: colors.teal, marginTop: 12 }]}
                    accessibilityLabel="Add a project task"
                  >
                    <Feather name="plus" size={16} color="#fff" />
                    <Text style={styles.composeBtnText}>Add task</Text>
                  </Pressable>
                </>
              ) : (
                <EmptyState
                  icon="layers"
                  text="switch to project mode to see tasks"
                  colors={colors}
                />
              )}
            </View>
          )}

          {tab === "chat" && (
            <View style={{ gap: 12 }}>
              {/* Hub chat messages */}
              <View style={[styles.chatBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Text style={[styles.chatLabel, { color: colors.mutedForeground }]}>
                  HUB CHAT · quick conversations, voice notes, shared links
                </Text>
                {/* Simulated chat messages */}
                {onlineMembers.slice(0, 3).map((u) => (
                  <View key={u!.id} style={styles.chatMsg}>
                    <View style={[styles.chatAvatar, { backgroundColor: u!.avatarColor }]}>
                      <Text style={styles.chatAvatarText}>{u!.avatarGlyph}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.chatMsgName, { color: colors.text }]}>{u!.name}</Text>
                      <Text style={[styles.chatMsgBody, { color: colors.mutedForeground }]}>
                        hey, anyone working on the shared moodboard?
                      </Text>
                    </View>
                    <Text style={[styles.chatMsgTime, { color: colors.subtle }]}>2m</Text>
                  </View>
                ))}
                {selfId && (
                  <View style={styles.chatMsg}>
                    <View style={[styles.chatAvatar, { backgroundColor: colors.primary }]}>
                      <Text style={styles.chatAvatarText}>Y</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.chatMsgName, { color: colors.text }]}>You</Text>
                      <Text style={[styles.chatMsgBody, { color: colors.mutedForeground }]}>
                        just joined — excited to contribute!
                      </Text>
                    </View>
                    <Text style={[styles.chatMsgTime, { color: colors.subtle }]}>1m</Text>
                  </View>
                )}
              </View>
              <View style={[styles.chatInputRow, { borderColor: colors.border }]}>
                <TextInput
                  value={chatInput}
                  onChangeText={setChatInput}
                  placeholder="say something..."
                  placeholderTextColor={colors.subtle}
                  style={[styles.chatInput, { color: colors.text, backgroundColor: colors.card }]}
                  accessibilityLabel="Type a message"
                />
                <Pressable
                  onPress={handleSendChat}
                  disabled={!chatInput.trim()}
                  style={[
                    styles.chatSend,
                    { backgroundColor: chatInput.trim() ? colors.primary : colors.border },
                  ]}
                  accessibilityLabel="Send message"
                >
                  <Feather name="send" size={16} color="#fff" />
                </Pressable>
                <Pressable
                  style={[styles.chatVoiceBtn, { borderColor: colors.border }]}
                  accessibilityLabel="Send voice note"
                >
                  <Feather name="mic" size={16} color={colors.teal} />
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

function EmptyState({
  icon,
  text,
  colors,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  text: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.emptyState, { borderColor: colors.border }]} accessible accessibilityLabel={text}>
      <Feather name={icon} size={24} color={colors.mutedForeground} />
      <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 13 }}>{text}</Text>
    </View>
  );
}

function Orbiter({
  color,
  glyph,
  index,
  total,
}: {
  color: string;
  glyph: string;
  index: number;
  total: number;
}) {
  const angle = (Math.PI * 2 * index) / total;
  const r = 110;
  const rotate = useSharedValue(0);
  useEffect(() => {
    rotate.value = withRepeat(
      withTiming(1, { duration: 18000 + index * 600, easing: Easing.linear }),
      -1,
      false,
    );
  }, [rotate, index]);
  const style = useAnimatedStyle(() => {
    const a = angle + rotate.value * Math.PI * 2;
    return {
      transform: [
        { translateX: Math.cos(a) * r },
        { translateY: Math.sin(a) * r },
      ],
    };
  });
  return (
    <Animated.View style={[styles.orbiter, { backgroundColor: color }, style]}>
      <Text style={styles.orbiterText}>{glyph}</Text>
    </Animated.View>
  );
}

function Window({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={[styles.window, { borderColor: color + "55" }]} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={[styles.windowLabel, { color }]}>{label.toUpperCase()}</Text>
      <Text style={styles.windowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  modeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(245,240,255,0.04)",
  },
  spatial: {
    height: 280,
    margin: 16,
    borderRadius: 24,
    overflow: "hidden",
  },
  orbiters: { flex: 1, alignItems: "center", justifyContent: "center" },
  orbiter: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  orbiterText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
  center: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(7,2,26,0.7)",
  },
  centerText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    letterSpacing: -0.5,
  },
  centerLabel: {
    color: "#FFD56B",
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    letterSpacing: 1.2,
  },
  projectBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  projectTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 0.6,
  },
  projectMeta: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  windowsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  window: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: "rgba(245,240,255,0.04)",
  },
  windowLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 4,
  },
  windowValue: {
    color: "#F5F0FF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  tabRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  tabText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.3,
  },
  composeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 999,
    marginBottom: 14,
  },
  composeBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
  createRoomBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 14,
  },
  createRoomBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  memberRow: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  memberAvatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },
  memberOnlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#170A2E",
  },
  memberName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  memberBio: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  miniTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  miniTagText: { fontSize: 9, fontFamily: "Inter_500Medium" },
  sectionLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  allMembersNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
  voiceRoomRow: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  liveDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(251,113,133,0.2)",
  },
  liveDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  voiceRoomTopic: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  voiceRoomMeta: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  taskSection: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  taskSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  taskSectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 12, flex: 1 },
  taskItem: { flexDirection: "row", alignItems: "center", gap: 9 },
  taskDot: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  taskLabel: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1 },
  taskProgress: { fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 4 },
  chatBox: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  chatLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 6,
  },
  chatMsg: { flexDirection: "row", alignItems: "center", gap: 8 },
  chatAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  chatAvatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 10 },
  chatMsgName: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  chatMsgBody: { fontFamily: "Inter_400Regular", fontSize: 12 },
  chatMsgTime: { fontFamily: "Inter_400Regular", fontSize: 10 },
  chatInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    padding: 4,
  },
  chatInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  chatSend: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  chatVoiceBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
});
