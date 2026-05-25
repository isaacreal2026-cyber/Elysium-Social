import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlowOrb } from "@/components/GlowOrb";
import { StarField } from "@/components/StarField";
import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";

interface OrbDef {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  route: string;
  colors: [string, string];
  count?: string;
}

const ORBS: OrbDef[] = [
  { key: "feed", label: "Feed", icon: "globe", route: "/feed", colors: ["#B57BFF", "#7C3AED"] },
  { key: "discover", label: "Discover", icon: "compass", route: "/discover", colors: ["#5EEAD4", "#0EA5E9"] },
  { key: "connect", label: "Connect", icon: "users", route: "/connections", colors: ["#F472B6", "#FB7185"] },
  { key: "groups", label: "Hubs", icon: "hexagon", route: "/groups", colors: ["#FFD56B", "#F97316"] },
  { key: "ai", label: "AI", icon: "cpu", route: "/ai-chat", colors: ["#B57BFF", "#5EEAD4"] },
  { key: "me", label: "Me", icon: "user", route: "/me", colors: ["#A78BFA", "#F472B6"] },
];

const RADIUS = 128;

export default function OrbitConstellation() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { posts, hubs, voiceRooms, userById, selfId } = useResonance();
  const [expanded, setExpanded] = useState(true);
  const expand = useSharedValue(0);
  const me = userById(selfId);

  useEffect(() => {
    expand.value = withDelay(
      200,
      withSpring(expanded ? 1 : 0, { damping: 14, stiffness: 105 }),
    );
  }, [expanded, expand]);

  const livePost = posts.reduce((a, b) => (a.energy > b.energy ? a : b), posts[0]!);
  const liveAuthor = userById(livePost?.authorId ?? "");
  const liveRoom = voiceRooms.find((v) => v.live);

  const topPad = (Platform.OS === "web" ? Math.max(insets.top, 16) : insets.top) + 8;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient colors={["#150A2E", "#07021A"]} style={StyleSheet.absoluteFill} />
      <StarField density={90} seed={11} />

      {/* Header */}
      <View style={[styles.topRow, { paddingTop: topPad }]}>
        <Pressable onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: "rgba(245,240,255,0.06)", borderColor: colors.border }]}>
          <Feather name="chevron-down" size={20} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={[styles.tinyLabel, { color: colors.gold }]}>ORBITAL LAUNCHER</Text>
          <Text style={[styles.greetName, { color: colors.text }]}>
            {me?.name?.split(" ")[0]?.toLowerCase() ?? "you"}'s cosmos
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/composer" as never)}
          style={[styles.iconBtn, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}
        >
          <Feather name="plus" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {/* Constellation */}
      <View style={styles.center}>
        <View style={styles.constellation}>
          {ORBS.map((orb, i) => (
            <FloatingOrb key={orb.key} orb={orb} index={i} expand={expand} />
          ))}

          {/* Center orb */}
          <Pressable onPress={() => setExpanded((e) => !e)} style={styles.centerPressable}>
            <GlowOrb size={104} colors={[colors.primary, "#5EEAD4"]} glyph="✦" intensity={1.3} />
          </Pressable>
        </View>

        <Text style={[styles.tagline, { color: colors.subtle }]}>
          tap an orb · press center to collapse
        </Text>
      </View>

      {/* Live deck */}
      <View style={[styles.deck, { paddingBottom: insets.bottom + 18 }]}>
        {livePost ? (
          <Pressable
            onPress={() => router.push(`/post/${livePost.id}` as never)}
            style={[styles.deckCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.deckHead}>
              <View style={[styles.deckDot, { backgroundColor: colors.gold }]} />
              <Text style={[styles.deckTag, { color: colors.gold }]}>MOMENT</Text>
            </View>
            <Text style={[styles.deckBody, { color: colors.text }]} numberOfLines={2}>
              {liveAuthor?.name} — {livePost.body.slice(0, 64)}
            </Text>
          </Pressable>
        ) : null}

        {liveRoom ? (
          <Pressable
            onPress={() => router.push("/voice-party" as never)}
            style={[styles.deckCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.deckHead}>
              <View style={[styles.deckDot, { backgroundColor: colors.rose }]} />
              <Text style={[styles.deckTag, { color: colors.rose }]}>LIVE</Text>
            </View>
            <Text style={[styles.deckBody, { color: colors.text }]} numberOfLines={2}>
              {liveRoom.topic}
            </Text>
            <Text style={[styles.deckMeta, { color: colors.mutedForeground }]}>
              {liveRoom.listeners} listening
            </Text>
          </Pressable>
        ) : null}

        {hubs[0] ? (
          <Pressable
            onPress={() => router.push("/groups" as never)}
            style={[styles.deckCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.deckHead}>
              <View style={[styles.deckDot, { backgroundColor: colors.teal }]} />
              <Text style={[styles.deckTag, { color: colors.teal }]}>HUB</Text>
            </View>
            <Text style={[styles.deckBody, { color: colors.text }]} numberOfLines={2}>
              {hubs[0].name}
            </Text>
            <Text style={[styles.deckMeta, { color: colors.mutedForeground }]}>
              {hubs[0].online.length} orbiting now
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function FloatingOrb({
  orb,
  index,
  expand,
}: {
  orb: OrbDef;
  index: number;
  expand: SharedValue<number>;
}) {
  const angle = (Math.PI * 2 * index) / ORBS.length - Math.PI / 2;
  const x = Math.cos(angle) * RADIUS;
  const y = Math.sin(angle) * RADIUS;
  const float = useSharedValue(0);

  useEffect(() => {
    const dur = 2000 + index * 180;
    float.value = withDelay(
      index * 160,
      withSequence(
        withTiming(1, { duration: dur, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: dur, easing: Easing.inOut(Easing.ease) }),
      ),
    );
    const id = setInterval(() => {
      float.value = withSequence(
        withTiming(1, { duration: dur, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: dur, easing: Easing.inOut(Easing.ease) }),
      );
    }, dur * 2 + 80);
    return () => clearInterval(id);
  }, [index, float]);

  const aStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x * expand.value },
      { translateY: y * expand.value + (float.value - 0.5) * 9 },
      { scale: 0.35 + expand.value * 0.65 },
    ],
    opacity: expand.value,
  }));

  return (
    <Animated.View style={[styles.floatingOrb, aStyle]}>
      <Pressable
        onPress={() => router.push(orb.route as never)}
        style={styles.orbPress}
      >
        <GlowOrb size={52} colors={orb.colors} glyph="" intensity={0.65} />
        <View style={[styles.orbIcon, { pointerEvents: "none" } as any]}>
          <Feather name={orb.icon} size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.orbLabel}>{orb.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topRow: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  tinyLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    letterSpacing: 1.4,
    marginBottom: 3,
  },
  greetName: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    letterSpacing: -0.3,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  constellation: {
    width: RADIUS * 2 + 80,
    height: RADIUS * 2 + 80,
    alignItems: "center",
    justifyContent: "center",
  },
  centerPressable: { alignItems: "center", justifyContent: "center" },
  floatingOrb: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  orbPress: { alignItems: "center" },
  orbIcon: {
    position: "absolute",
    width: 83,
    height: 83,
    alignItems: "center",
    justifyContent: "center",
  },
  orbLabel: {
    marginTop: 6,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "#F5F0FF",
    letterSpacing: 0.4,
  },
  tagline: {
    marginTop: 28,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    letterSpacing: 0.3,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  deck: {
    paddingHorizontal: 14,
    flexDirection: "row",
    gap: 10,
  },
  deckCard: {
    flex: 1,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 88,
    gap: 4,
  },
  deckHead: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 3 },
  deckDot: { width: 5, height: 5, borderRadius: 3 },
  deckTag: { fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 1.1 },
  deckBody: { fontFamily: "Inter_500Medium", fontSize: 12, lineHeight: 17 },
  deckMeta: { fontFamily: "Inter_400Regular", fontSize: 10, marginTop: 2 },
});
