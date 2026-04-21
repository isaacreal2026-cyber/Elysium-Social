import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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

export default function HubDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { hubs, posts, userById, toggleHubProjectMode } = useResonance();
  const hub = hubs.find((h) => h.id === id);

  if (!hub) {
    return (
      <ScreenShell title="Hub not found" subtitle="this hub drifted away" />
    );
  }

  const hubPosts = posts.filter((p) => hub.postIds.includes(p.id));

  return (
    <ScreenShell
      title={hub.name}
      subtitle={hub.tagline}
      rightAction={
        <Pressable
          onPress={() => toggleHubProjectMode(hub.id)}
          style={[styles.modeBtn, { borderColor: hub.projectMode ? colors.teal : colors.border }]}
        >
          <Feather name="layers" size={14} color={hub.projectMode ? colors.teal : colors.mutedForeground} />
        </Pressable>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.spatial}>
          <Image source={NEBULAS[hub.toneIndex]} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient colors={["rgba(7,2,26,0.4)", "rgba(7,2,26,0.95)"]} style={StyleSheet.absoluteFill} />
          <View style={styles.orbiters}>
            {hub.online.slice(0, 6).map((uid, i) => {
              const u = userById(uid);
              if (!u) return null;
              return <Orbiter key={uid} color={u.avatarColor} glyph={u.avatarGlyph} index={i} total={hub.online.length} />;
            })}
            <View style={[styles.center, { borderColor: colors.gold }]}>
              <Text style={styles.centerText}>{Math.round(hub.pulse * 100)}</Text>
              <Text style={styles.centerLabel}>PULSE</Text>
            </View>
          </View>
        </View>

        {hub.projectMode ? (
          <View style={[styles.projectBanner, { borderColor: colors.teal, backgroundColor: colors.teal + "11" }]}>
            <Feather name="layers" size={14} color={colors.teal} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.projectTitle, { color: colors.teal }]}>PROJECT MODE — collaborative canvas</Text>
              <Text style={[styles.projectMeta, { color: colors.mutedForeground }]}>
                shared moodboard · 12 tasks open · 3 voice notes pinned
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.teal} />
          </View>
        ) : null}

        <View style={[styles.windowsRow]}>
          <Window label="Recent" value={`${hubPosts.length} posts`} color={colors.primary} />
          <Window label="Voice" value="2 rooms live" color={colors.teal} />
          <Window label="Files" value="14 shared" color={colors.gold} />
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          {hubPosts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

function Orbiter({ color, glyph, index, total }: { color: string; glyph: string; index: number; total: number }) {
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
    <Animated.View style={[styles.orbiter, { backgroundColor: color, shadowColor: color }, style]}>
      <Text style={styles.orbiterText}>{glyph}</Text>
    </Animated.View>
  );
}

function Window({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.window, { borderColor: color + "55" }]}>
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
    shadowOpacity: 0.9,
    shadowRadius: 12,
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
  centerText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  centerLabel: { color: "#FFD56B", fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 1.2 },
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
  projectTitle: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 0.6 },
  projectMeta: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  windowsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 14 },
  window: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 1, backgroundColor: "rgba(245,240,255,0.04)" },
  windowLabel: { fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 1, marginBottom: 4 },
  windowValue: { color: "#F5F0FF", fontFamily: "Inter_600SemiBold", fontSize: 13 },
});
