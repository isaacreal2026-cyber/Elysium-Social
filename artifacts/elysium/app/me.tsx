import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { PostCard } from "@/components/PostCard";
import { ScreenShell } from "@/components/ScreenShell";
import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";

const TABS = [
  { key: "moments", label: "Moments", icon: "feather" as const },
  { key: "saved", label: "Saved", icon: "bookmark" as const },
  { key: "profile", label: "Profile", icon: "user" as const },
];

export default function MeScreen() {
  const colors = useColors();
  const { userById, selfId, posts, bookmarks } = useResonance();
  const me = userById(selfId)!;
  const myMoments = posts.filter((p) => p.authorId === selfId);
  const savedPosts = posts.filter((p) => bookmarks[p.id]);
  const [tab, setTab] = useState<"moments" | "saved" | "profile">("moments");

  const totalResonance = myMoments.reduce((acc, p) => {
    return acc + Object.values(p.resonance).reduce((a, b) => a + b, 0);
  }, 0);

  return (
    <ScreenShell
      title="My Soulprint"
      subtitle="your living portrait"
      showBack={false}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        {/* Cover */}
        <View style={styles.coverWrap}>
          <Image
            source={require("@/assets/images/nebula3.png")}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <LinearGradient
            colors={["rgba(7,2,26,0.15)", "rgba(7,2,26,0.92)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.coverInner}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: me.avatarColor,
                  borderColor: colors.background,
                },
              ]}
            >
              <Text style={styles.avatarText}>{me.avatarGlyph}</Text>
              <View
                style={[
                  styles.onlineDot,
                  {
                    backgroundColor: colors.emerald,
                    borderColor: colors.background,
                  },
                ]}
              />
            </View>
            <Text style={[styles.name, { color: "#fff" }]}>{me.name}</Text>
            <Text style={[styles.handle, { color: "rgba(245,240,255,0.7)" }]}>
              {me.handle} · {me.city}
            </Text>
            <Text style={[styles.bio, { color: "rgba(245,240,255,0.85)" }]}>
              {me.bio}
            </Text>

            {/* Voice intro pill */}
            <View style={styles.voicePill}>
              <View
                style={[styles.voicePlay, { backgroundColor: colors.gold }]}
              >
                <Feather name="play" size={10} color="#0E0524" />
              </View>
              <View style={styles.miniWave}>
                {Array.from({ length: 18 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.miniBar,
                      {
                        height: 3 + Math.abs(Math.sin(i * 0.6)) * 12,
                        backgroundColor: colors.gold,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.voiceTime, { color: colors.gold }]}>
                intro · {me.introVoiceSeconds}s
              </Text>
            </View>
          </View>
        </View>

        {/* Stats bar */}
        <View
          style={[
            styles.statsBar,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <StatCell
            label="Followers"
            value={
              me.followers >= 1000
                ? `${(me.followers / 1000).toFixed(1)}k`
                : String(me.followers)
            }
            color={colors.primary}
          />
          <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
          <StatCell
            label="Following"
            value={String(me.following)}
            color={colors.teal}
          />
          <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
          <StatCell
            label="Resonance"
            value={
              totalResonance >= 1000
                ? `${(totalResonance / 1000).toFixed(1)}k`
                : String(totalResonance)
            }
            color={colors.gold}
          />
          <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
          <StatCell
            label="Alignment"
            value={`${Math.round(me.alignmentScore * 100)}%`}
            color={colors.magenta}
          />
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => router.push("/composer" as never)}
            style={[
              styles.actionBtn,
              { backgroundColor: colors.primary, flex: 2 },
            ]}
          >
            <Feather name="plus" size={15} color="#fff" />
            <Text style={styles.actionBtnText}>Compose</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/orbit" as never)}
            style={[
              styles.actionBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
                flex: 1,
              },
            ]}
          >
            <Feather name="grid" size={15} color={colors.text} />
            <Text style={[styles.actionBtnText, { color: colors.text }]}>
              Orbit
            </Text>
          </Pressable>
        </View>
        {/* AI + Upgrade row */}
        <View style={[styles.actionsRow, { marginTop: 8 }]}>
          <Pressable
            onPress={() => router.push("/ai-chat" as never)}
            style={[
              styles.actionBtn,
              {
                backgroundColor: "#B57BFF22",
                borderColor: "#B57BFF55",
                borderWidth: 1,
                flex: 1,
              },
            ]}
          >
            <Feather name="cpu" size={15} color="#B57BFF" />
            <Text style={[styles.actionBtnText, { color: "#B57BFF" }]}>
              AI Assistant
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/payment" as never)}
            style={[
              styles.actionBtn,
              {
                backgroundColor: "#FFD56B22",
                borderColor: "#FFD56B55",
                borderWidth: 1,
                flex: 1,
              },
            ]}
          >
            <Feather name="zap" size={15} color="#FFD56B" />
            <Text style={[styles.actionBtnText, { color: "#FFD56B" }]}>
              Upgrade
            </Text>
          </Pressable>
        </View>

        {/* Tabs */}
        <View style={[styles.tabRow, { borderColor: colors.border }]}>
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key as typeof tab)}
                style={[
                  styles.tab,
                  {
                    borderBottomColor: active ? colors.primary : "transparent",
                  },
                ]}
              >
                <Feather
                  name={t.icon}
                  size={14}
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
          {tab === "moments" ? (
            myMoments.length === 0 ? (
              <EmptyState
                icon="feather"
                text="no moments yet — compose your first"
              />
            ) : (
              myMoments.map((p) => <PostCard key={p.id} post={p} />)
            )
          ) : tab === "saved" ? (
            savedPosts.length === 0 ? (
              <EmptyState icon="bookmark" text="nothing saved yet" />
            ) : (
              savedPosts.map((p) => <PostCard key={p.id} post={p} />)
            )
          ) : (
            /* Profile tab */
            <View style={{ gap: 16, paddingTop: 16 }}>
              <Section title="Personality" icon="smile">
                <View style={styles.chipRow}>
                  {me.tags.map((t) => (
                    <View
                      key={t}
                      style={[
                        styles.chip,
                        {
                          borderColor: colors.border,
                          backgroundColor: colors.primary + "12",
                        },
                      ]}
                    >
                      <Text
                        style={[styles.chipText, { color: colors.primary }]}
                      >
                        {t}
                      </Text>
                    </View>
                  ))}
                </View>
              </Section>

              <Section title="Destinations" icon="navigation">
                <View style={styles.chipRow}>
                  {me.destinations.map((d) => (
                    <Pressable
                      key={d}
                      onPress={() => router.push(`/tag/${d}` as never)}
                      style={[
                        styles.chip,
                        {
                          borderColor: colors.gold + "55",
                          backgroundColor: colors.gold + "12",
                        },
                      ]}
                    >
                      <Feather
                        name="navigation"
                        size={10}
                        color={colors.gold}
                      />
                      <Text style={[styles.chipText, { color: colors.gold }]}>
                        {d}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Section>

              <Section title="Activity" icon="bar-chart-2">
                <View
                  style={[
                    styles.activityCard,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                    },
                  ]}
                >
                  <ActivityRow
                    label="Weekly visitors"
                    value={me.weeklyVisitors}
                    color={colors.teal}
                  />
                  <ActivityRow
                    label="Moments shared"
                    value={myMoments.length}
                    color={colors.primary}
                  />
                  <ActivityRow
                    label="Alignment score"
                    value={`${Math.round(me.alignmentScore * 100)}%`}
                    color={colors.gold}
                  />
                </View>
              </Section>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

function StatCell({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View>
      <View style={styles.sectionHead}>
        <Feather name={icon} size={12} color={colors.mutedForeground} />
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          {title.toUpperCase()}
        </Text>
      </View>
      {children}
    </View>
  );
}

function ActivityRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.activityRow}>
      <Text style={[styles.activityLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.activityValue, { color }]}>{value}</Text>
    </View>
  );
}

function EmptyState({
  icon,
  text,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  text: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.empty, { borderColor: colors.border }]}>
      <Feather name={icon} size={22} color={colors.mutedForeground} />
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
  coverWrap: { height: 240, position: "relative" },
  coverInner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    gap: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    marginBottom: 8,
    position: "relative",
  },
  avatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 28 },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  name: { fontFamily: "Inter_700Bold", fontSize: 22, letterSpacing: -0.5 },
  handle: { fontFamily: "Inter_400Regular", fontSize: 13 },
  bio: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  voicePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,213,107,0.12)",
    marginTop: 8,
  },
  voicePlay: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  miniWave: { flexDirection: "row", alignItems: "center", gap: 2, height: 16 },
  miniBar: { width: 2, borderRadius: 1 },
  voiceTime: { fontFamily: "Inter_700Bold", fontSize: 11 },
  statsBar: {
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    paddingVertical: 14,
  },
  statCell: { flex: 1, alignItems: "center" },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 16 },
  statLabel: {
    color: "#A89AC8",
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  statDiv: { width: 1, alignSelf: "stretch", marginVertical: 4 },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 999,
  },
  actionBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
  tabRow: {
    flexDirection: "row",
    marginTop: 18,
    marginHorizontal: 14,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 5,
    borderBottomWidth: 2,
  },
  tabText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.1,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  activityCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  activityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(245,240,255,0.06)",
  },
  activityLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  activityValue: { fontFamily: "Inter_700Bold", fontSize: 14 },
  empty: {
    marginTop: 16,
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    gap: 8,
  },
});
