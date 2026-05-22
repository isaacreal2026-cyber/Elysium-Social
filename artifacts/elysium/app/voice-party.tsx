import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StarField } from "@/components/StarField";
import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";

export default function VoicePartyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { voiceRooms, userById } = useResonance();
  const room = voiceRooms.find((v) => v.live) ?? voiceRooms[0]!;
  const speakers = room.speakers.map((id) => userById(id)).filter(Boolean);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient colors={["#1A0B3A", "#07021A"]} style={StyleSheet.absoluteFill} />
      <StarField density={140} seed={43} />

      <View style={[styles.header, { marginTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="chevron-down" size={22} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={[styles.label, { color: colors.gold }]}>VOICE ROOM · LIVE</Text>
          <Text style={[styles.topic, { color: colors.text }]} numberOfLines={2}>{room.topic}</Text>
        </View>
        <Pressable style={styles.iconBtn}>
          <Feather name="more-horizontal" size={22} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.stage}>
        {speakers.map((u, i) => (
          <SpeakingOrb
            key={u!.id}
            color={u!.avatarColor}
            glyph={u!.avatarGlyph}
            name={u!.name}
            index={i}
            total={speakers.length}
          />
        ))}
      </View>

      <View style={styles.bottom}>
        <View style={[styles.metaPill, { borderColor: colors.border }]}>
          <View style={[styles.dot, { backgroundColor: colors.rose }]} />
          <Text style={[styles.metaText, { color: colors.text }]}>{room.listeners} listening</Text>
          <Text style={[styles.metaSubText, { color: colors.mutedForeground }]}> · {room.vibe.toLowerCase()} vibe</Text>
        </View>

        <View style={styles.controls}>
          <Pressable style={[styles.ctrl, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Feather name="thumbs-up" size={20} color={colors.text} />
          </Pressable>
          <Pressable style={[styles.ctrlMain, { backgroundColor: colors.primary }]}>
            <Feather name="mic" size={26} color="#fff" />
          </Pressable>
          <Pressable
            onPress={() => router.back()}
            style={[styles.ctrl, { borderColor: colors.destructive, backgroundColor: colors.destructive + "22" }]}
          >
            <Feather name="log-out" size={20} color={colors.destructive} />
          </Pressable>
        </View>

        <Text style={[styles.exitHelp, { color: colors.mutedForeground }]}>
          gentle exit · ramp out anytime · the room continues
        </Text>
      </View>
    </View>
  );
}

function SpeakingOrb({
  color,
  glyph,
  name,
  index,
  total,
}: {
  color: string;
  glyph: string;
  name: string;
  index: number;
  total: number;
}) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const r = 110;
  const x = Math.cos(angle) * r;
  const y = Math.sin(angle) * r;
  const ring = useSharedValue(0);
  useEffect(() => {
    ring.value = withDelay(
      index * 400,
      withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }), -1, false),
    );
  }, [ring, index]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + ring.value * 1.4 }],
    opacity: 1 - ring.value,
  }));

  return (
    <View style={[styles.speakerWrap, { transform: [{ translateX: x }, { translateY: y }] }]}>
      <Animated.View
        style={[
          styles.speakerRing,
          { borderColor: color },
          ringStyle,
        ]}
      />
      <View style={[styles.speaker, { backgroundColor: color }]}>
        <Text style={styles.speakerGlyph}>{glyph}</Text>
      </View>
      <Text style={styles.speakerName}>{name.split(" ")[0]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(245,240,255,0.06)",
  },
  label: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1.5 },
  topic: { fontFamily: "Inter_700Bold", fontSize: 16, marginTop: 4, textAlign: "center", letterSpacing: -0.3 },
  stage: { flex: 1, alignItems: "center", justifyContent: "center" },
  speakerWrap: { position: "absolute", alignItems: "center", justifyContent: "center" },
  speakerRing: {
    position: "absolute",
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
  },
  speaker: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 12,
  },
  speakerGlyph: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 22 },
  speakerName: {
    marginTop: 8,
    color: "#F5F0FF",
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  bottom: { paddingHorizontal: 24, paddingBottom: 32, alignItems: "center", gap: 16 },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(245,240,255,0.04)",
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  metaText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  metaSubText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  controls: { flexDirection: "row", alignItems: "center", gap: 18 },
  ctrl: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  ctrlMain: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 0 24px #B57BFF99" }
      : { shadowColor: "#B57BFF", shadowOpacity: 0.9, shadowRadius: 24 }),
  },
  exitHelp: { fontFamily: "Inter_400Regular", fontSize: 11, textAlign: "center" },
});
