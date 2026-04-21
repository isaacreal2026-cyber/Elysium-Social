import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { PostCard } from "@/components/PostCard";
import { ScreenShell } from "@/components/ScreenShell";
import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";

export default function MeScreen() {
  const colors = useColors();
  const { userById, selfId, posts } = useResonance();
  const me = userById(selfId)!;
  const myMoments = posts.filter((p) => p.authorId === selfId);

  return (
    <ScreenShell title="Soulprint" subtitle="your living portrait">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.heroWrap}>
          <Image source={require("@/assets/images/nebula3.png")} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient colors={["rgba(7,2,26,0.2)", "rgba(7,2,26,0.95)"]} style={StyleSheet.absoluteFill} />
          <View style={styles.heroInner}>
            <View style={[styles.heroAvatar, { backgroundColor: me.avatarColor }]}>
              <Text style={styles.heroAvatarText}>{me.avatarGlyph}</Text>
            </View>
            <Text style={styles.heroName}>{me.name}</Text>
            <Text style={styles.heroHandle}>{me.handle} · {me.city}</Text>
            <Text style={styles.heroBio}>{me.bio}</Text>
            <View style={styles.heroVoice}>
              <Feather name="play" size={12} color="#0E0524" />
              <Text style={styles.heroVoiceText}>intro · {me.introVoiceSeconds}s</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Stat label="alignment" value={`${Math.round(me.alignmentScore * 100)}`} color={colors.primary} />
          <Stat label="visitors / wk" value={`${me.weeklyVisitors}`} color={colors.gold} />
          <Stat label="moments" value={`${myMoments.length}`} color={colors.teal} />
        </View>

        <Section title="Personality" icon="user">
          <View style={styles.tagRow}>
            {me.tags.map((t) => (
              <View key={t} style={[styles.tag, { borderColor: colors.border, backgroundColor: "rgba(181,123,255,0.08)" }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>{t}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Destinations" icon="navigation">
          <View style={styles.tagRow}>
            {me.destinations.map((t) => (
              <View key={t} style={[styles.tag, { borderColor: colors.border, backgroundColor: "rgba(255,213,107,0.08)" }]}>
                <Text style={[styles.tagText, { color: colors.gold }]}>↗ {t}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Weekly Visitors" icon="eye">
          <View style={[styles.visitorBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[styles.visitorBig, { color: colors.text }]}>{me.weeklyVisitors}</Text>
            <Text style={[styles.visitorCaption, { color: colors.mutedForeground }]}>
              soulprint visits over the past 7 days · 4 close friends peeked
            </Text>
          </View>
        </Section>

        <Section title="Moments" icon="image">
          {myMoments.length === 0 ? (
            <View style={[styles.empty, { borderColor: colors.border }]}>
              <Feather name="feather" size={24} color={colors.mutedForeground} />
              <Text style={{ color: colors.mutedForeground, marginTop: 8, fontFamily: "Inter_500Medium" }}>
                you haven't posted yet — drop a voice note from the composer
              </Text>
            </View>
          ) : (
            <View style={{ paddingHorizontal: 16 }}>
              {myMoments.map((m) => (
                <PostCard key={m.id} post={m} />
              ))}
            </View>
          )}
        </Section>
      </ScrollView>
    </ScreenShell>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ComponentProps<typeof Feather>["name"]; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 22 }}>
      <View style={styles.sectionHeader}>
        <Feather name={icon} size={12} color="#A89AC8" />
        <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      </View>
      <View style={{ paddingHorizontal: 16 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    height: 280,
    overflow: "hidden",
    margin: 16,
    borderRadius: 24,
  },
  heroInner: { padding: 22, paddingTop: 36, gap: 6, flex: 1, justifyContent: "flex-end" },
  heroAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  heroAvatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 24 },
  heroName: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5, marginTop: 6 },
  heroHandle: { color: "#A89AC8", fontFamily: "Inter_500Medium", fontSize: 13 },
  heroBio: { color: "#F5F0FF", fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20, marginTop: 4 },
  heroVoice: {
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFD56B",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 10,
  },
  heroVoiceText: { color: "#0E0524", fontFamily: "Inter_600SemiBold", fontSize: 11 },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
  },
  stat: {
    flex: 1,
    padding: 14,
    backgroundColor: "rgba(245,240,255,0.04)",
    borderRadius: 16,
    alignItems: "center",
  },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 22, letterSpacing: -0.4 },
  statLabel: { fontFamily: "Inter_500Medium", fontSize: 10, color: "#A89AC8", marginTop: 4, letterSpacing: 0.4, textTransform: "uppercase" },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, marginBottom: 8 },
  sectionTitle: { color: "#A89AC8", fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1.2 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  tagText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  visitorBox: { padding: 16, borderRadius: 18, borderWidth: 1 },
  visitorBig: { fontFamily: "Inter_700Bold", fontSize: 32 },
  visitorCaption: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 6 },
  empty: {
    margin: 16,
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
  },
});
