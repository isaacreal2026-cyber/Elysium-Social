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
}

const ORBS: OrbDef[] = [
  { key: "feed", label: "Feed", icon: "globe", route: "/feed", colors: ["#B57BFF", "#7C3AED"] },
  { key: "discover", label: "Discover", icon: "compass", route: "/discover", colors: ["#5EEAD4", "#0EA5E9"] },
  { key: "connect", label: "Connections", icon: "users", route: "/connections", colors: ["#F472B6", "#FB7185"] },
  { key: "groups", label: "Hubs", icon: "hexagon", route: "/groups", colors: ["#FFD56B", "#F97316"] },
  { key: "gather", label: "Gather", icon: "book-open", route: "/gather", colors: ["#34D399", "#06B6D4"] },
  { key: "me", label: "Me", icon: "user", route: "/me", colors: ["#A78BFA", "#F472B6"] },
];

const RADIUS = 130;

export default function OrbitalHome() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { posts, hubs, voiceRooms, userById, selfId } = useResonance();
  const [expanded, setExpanded] = useState(true);
  const expand = useSharedValue(0);
  const me = userById(selfId);

  useEffect(() => {
    expand.value = withDelay(
      300,
      withSpring(expanded ? 1 : 0, { damping: 12, stiffness: 110 }),
    );
  }, [expanded, expand]);

  const livePost = posts.reduce((a, b) => (a.energy > b.energy ? a : b), posts[0]!);
  const liveAuthor = userById(livePost.authorId);
  const liveRoom = voiceRooms.find((v) => v.live);

  const isWeb = Platform.OS === "web";
  const topPad = (isWeb ? Math.max(insets.top, 67) : insets.top) + 8;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient colors={["#150A2E", "#07021A"]} style={StyleSheet.absoluteFill} />
      <StarField density={120} seed={11} />

      <View style={[styles.topRow, { paddingTop: topPad }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>tonight</Text>
          <Text style={[styles.greetingName, { color: colors.text }]}>welcome back, {me?.name?.toLowerCase() ?? "you"}</Text>
        </View>
        <Pressable
          onPress={() => router.push("/composer" as never)}
          style={[styles.composeBtn, { borderColor: colors.border }]}
        >
          <Feather name="plus" size={18} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.center}>
        <View style={styles.constellation}>
          {ORBS.map((orb, i) => (
            <FloatingOrb key={orb.key} orb={orb} index={i} expand={expand} />
          ))}
          <Pressable onPress={() => setExpanded((e) => !e)}>
            <GlowOrb
              size={108}
              colors={["#B57BFF", "#5EEAD4"]}
              glyph="✦"
              intensity={1.4}
            />
          </Pressable>
        </View>
        <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
          tap an orb · pull on a thread · let it resonate
        </Text>
      </View>

      <View style={styles.bottomDeck}>
        <Pressable
          onPress={() => router.push(`/post/${livePost.id}` as never)}
          style={[styles.deckCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.deckHeader}>
            <View style={[styles.dot, { backgroundColor: colors.gold }]} />
            <Text style={[styles.deckLabel, { color: colors.gold }]}>SPARK MOMENT</Text>
          </View>
          <Text style={[styles.deckTitle, { color: colors.text }]} numberOfLines={2}>
            {liveAuthor?.name} just lit up the feed — {livePost.body.slice(0, 70)}…
          </Text>
        </Pressable>
        {liveRoom ? (
          <Pressable
            onPress={() => router.push("/voice-party" as never)}
            style={[styles.deckCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.deckHeader}>
              <View style={[styles.dot, { backgroundColor: colors.teal }]} />
              <Text style={[styles.deckLabel, { color: colors.teal }]}>VOICE ROOM · LIVE</Text>
            </View>
            <Text style={[styles.deckTitle, { color: colors.text }]} numberOfLines={2}>
              {liveRoom.topic}
            </Text>
            <Text style={[styles.deckMeta, { color: colors.mutedForeground }]}>
              {liveRoom.listeners} listening · {liveRoom.vibe} vibe
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => router.push("/groups" as never)}
          style={[styles.deckCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.deckHeader}>
            <View style={[styles.dot, { backgroundColor: colors.magenta }]} />
            <Text style={[styles.deckLabel, { color: colors.magenta }]}>NEXUS PULSE</Text>
          </View>
          <Text style={[styles.deckTitle, { color: colors.text }]} numberOfLines={2}>
            {hubs[0]?.name} is humming — {hubs[0]?.online.length} orbiting now
          </Text>
        </Pressable>
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
    float.value = withDelay(
      index * 120,
      withSequence(
        withTiming(1, { duration: 1800 + index * 80, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1800 + index * 80, easing: Easing.inOut(Easing.ease) }),
      ),
    );
    const id = setInterval(() => {
      float.value = withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      );
    }, 4400);
    return () => clearInterval(id);
  }, [index, float]);

  const aStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x * expand.value },
      { translateY: y * expand.value + (float.value - 0.5) * 8 },
      { scale: 0.4 + expand.value * 0.6 },
    ],
    opacity: expand.value,
  }));

  return (
    <Animated.View style={[styles.floatingOrb, aStyle]}>
      <Pressable
        onPress={() => router.push(orb.route as never)}
        style={{ alignItems: "center" }}
      >
        <GlowOrb
          size={56}
          colors={orb.colors}
          glyph=""
          intensity={0.7}
        />
        <View style={styles.orbIcon} pointerEvents="none">
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
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  greeting: { fontFamily: "Inter_400Regular", fontSize: 12, letterSpacing: 1, textTransform: "uppercase" },
  greetingName: { fontFamily: "Inter_700Bold", fontSize: 22, marginTop: 4, letterSpacing: -0.5 },
  composeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(245,240,255,0.04)",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
  },
  constellation: {
    width: RADIUS * 2 + 80,
    height: RADIUS * 2 + 80,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingOrb: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  orbIcon: {
    position: "absolute",
    top: 0,
    width: 89,
    height: 89,
    alignItems: "center",
    justifyContent: "center",
  },
  orbLabel: {
    marginTop: 8,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "#F5F0FF",
    letterSpacing: 0.4,
  },
  tagline: {
    marginTop: 32,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    letterSpacing: 0.4,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  bottomDeck: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    flexDirection: "row",
    gap: 10,
  },
  deckCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 96,
  },
  deckHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  deckLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 1,
  },
  deckTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    lineHeight: 16,
  },
  deckMeta: { marginTop: 6, fontFamily: "Inter_400Regular", fontSize: 10 },
});
