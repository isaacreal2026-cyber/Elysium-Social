import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated as RNAnimated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
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

type MicState = "idle" | "requesting" | "recording" | "muted";

export default function VoicePartyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ roomId?: string }>();
  const { voiceRooms, userById, joinVoiceRoom, leaveVoiceRoom, createVoiceRoom, selfId } = useResonance();

  // Find the room — either from params or the first live one
  const room = params.roomId
    ? voiceRooms.find((v) => v.id === params.roomId)
    : voiceRooms.find((v) => v.live) ?? voiceRooms[0];
  const speakers = room ? room.speakers.map((id) => userById(id)).filter(Boolean) : [];
  const isSpeaker = room ? room.speakers.includes(selfId) : false;

  const [micState, setMicState] = useState<MicState>("idle");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isJoined, setIsJoined] = useState(false);
  const pulseAnim = useRef(new RNAnimated.Value(1)).current;

  // Animate mic pulse when recording
  useEffect(() => {
    if (micState === "recording") {
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          RNAnimated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [micState, pulseAnim]);

  // Recording timer
  useEffect(() => {
    if (micState !== "recording") {
      setRecordingSeconds(0);
      return;
    }
    const interval = setInterval(() => {
      setRecordingSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [micState]);

  const handleMicToggle = useCallback(() => {
    if (micState === "idle" || micState === "muted") {
      setMicState("requesting");
      // Simulate permission request
      setTimeout(() => {
        setMicState("recording");
        AccessibilityInfo.announceForAccessibility("Microphone on, you are now speaking");
      }, 400);
    } else if (micState === "recording") {
      setMicState("muted");
      AccessibilityInfo.announceForAccessibility("Microphone muted");
    }
  }, [micState]);

  const handleJoin = useCallback(() => {
    if (room) {
      joinVoiceRoom(room.id);
      setIsJoined(true);
      AccessibilityInfo.announceForAccessibility(`Joined ${room.topic}`);
    }
  }, [room, joinVoiceRoom]);

  const handleLeave = useCallback(() => {
    if (room) {
      leaveVoiceRoom(room.id);
      router.back();
    }
  }, [room, leaveVoiceRoom]);

  if (!room) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.text, fontFamily: "Inter_500Medium", fontSize: 16 }}>
            No voice rooms available
          </Text>
          <Pressable
            onPress={() => {
              createVoiceRoom({ topic: "New room", vibe: "Warm" });
            }}
            style={[styles.createBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="plus" size={16} color="#fff" />
            <Text style={styles.createBtnText}>Create a room</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.background === "#F5F3FF" ? "#E4DEF0" : "#1A0B3A", colors.background]}
        style={StyleSheet.absoluteFill}
      />
      <StarField density={140} seed={43} />

      <View style={[styles.header, { marginTop: insets.top + 8 }]}>
        <Pressable
          onPress={handleLeave}
          style={styles.iconBtn}
          accessibilityLabel="Leave voice room"
        >
          <Feather name="chevron-down" size={22} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={[styles.label, { color: colors.gold }]}>
            VOICE ROOM · {room.live ? "LIVE" : "ENDED"}
          </Text>
          <Text
            style={[styles.topic, { color: colors.text }]}
            numberOfLines={2}
          >
            {room.topic}
          </Text>
        </View>
        <Pressable style={styles.iconBtn} accessibilityLabel="More options">
          <Feather name="more-horizontal" size={22} color={colors.text} />
        </Pressable>
      </View>

      {/* Speaker stage */}
      <View style={styles.stage} accessibilityLabel={`${speakers.length} speakers`}>
        {speakers.map((u, i) => (
          <SpeakingOrb
            key={u!.id}
            color={u!.avatarColor}
            glyph={u!.avatarGlyph}
            name={u!.name}
            index={i}
            total={speakers.length}
            isSpeaking={micState === "recording" && u!.id === selfId}
          />
        ))}
      </View>

      {/* Waveform visualization when recording */}
      {micState === "recording" ? (
        <View style={styles.waveformSection}>
          <View style={styles.waveformRow}>
            {Array.from({ length: 40 }).map((_, i) => (
              <RNAnimated.View
                key={i}
                style={[
                  styles.wavebar,
                  {
                    height: 4 + Math.abs(Math.sin(i * 0.5 + recordingSeconds * 0.3)) * 22,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.recordingTime, { color: colors.rose }]}>
            ● {formatTime(recordingSeconds)}
          </Text>
        </View>
      ) : null}

      <View style={styles.bottom}>
        {/* Listener count */}
        <View style={[styles.metaPill, { borderColor: colors.border }]}>
          <View style={[styles.dot, { backgroundColor: colors.rose }]} />
          <Text style={[styles.metaText, { color: colors.text }]}>
            {room.listeners} listening
          </Text>
          <Text style={[styles.metaSubText, { color: colors.mutedForeground }]}>
            {" "}
            · {room.vibe.toLowerCase()} vibe
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* React button */}
          <Pressable
            style={[styles.ctrl, { borderColor: colors.border, backgroundColor: colors.card }]}
            accessibilityLabel="Send reaction"
          >
            <Feather name="thumbs-up" size={20} color={colors.text} />
          </Pressable>

          {/* Mic toggle */}
          <RNAnimated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              onPress={isJoined ? handleMicToggle : handleJoin}
              style={[
                styles.ctrlMain,
                {
                  backgroundColor:
                    micState === "recording"
                      ? colors.rose
                      : micState === "muted"
                        ? colors.border
                        : colors.primary,
                },
              ]}
              accessibilityLabel={
                isJoined
                  ? micState === "recording"
                    ? "Mute microphone"
                    : "Unmute microphone"
                  : "Join voice room"
              }
              accessibilityRole="button"
            >
              <Feather
                name={
                  !isJoined
                    ? "phone"
                    : micState === "recording"
                      ? "mic"
                      : "mic-off"
                }
                size={26}
                color="#fff"
              />
            </Pressable>
          </RNAnimated.View>

          {/* Leave button */}
          <Pressable
            onPress={handleLeave}
            style={[
              styles.ctrl,
              {
                borderColor: colors.destructive,
                backgroundColor: colors.destructive + "22",
              },
            ]}
            accessibilityLabel="Leave voice room"
          >
            <Feather name="log-out" size={20} color={colors.destructive} />
          </Pressable>
        </View>

        {/* Status indicator */}
        <Text style={[styles.exitHelp, { color: colors.mutedForeground }]}>
          {!isJoined
            ? "tap the center button to join the room"
            : micState === "recording"
              ? "you're speaking — tap to mute"
              : micState === "muted"
                ? "muted — tap to unmute"
                : "gentle exit · ramp out anytime · the room continues"}
        </Text>
      </View>
    </View>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function SpeakingOrb({
  color,
  glyph,
  name,
  index,
  total,
  isSpeaking,
}: {
  color: string;
  glyph: string;
  name: string;
  index: number;
  total: number;
  isSpeaking?: boolean;
}) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const r = 110;
  const x = Math.cos(angle) * r;
  const y = Math.sin(angle) * r;
  const ring = useSharedValue(0);
  useEffect(() => {
    ring.value = withDelay(
      index * 400,
      withRepeat(
        withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }),
        -1,
        false,
      ),
    );
  }, [ring, index]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + ring.value * 1.4 }],
    opacity: 1 - ring.value,
  }));

  return (
    <View
      style={[
        styles.speakerWrap,
        { transform: [{ translateX: x }, { translateY: y }] },
      ]}
      accessible
      accessibilityLabel={`${name} is ${isSpeaking ? "speaking" : "in the room"}`}
    >
      <Animated.View
        style={[styles.speakerRing, { borderColor: color }, ringStyle]}
      />
      <View
        style={[
          styles.speaker,
          {
            backgroundColor: color,
            ...(isSpeaking ? { borderWidth: 3, borderColor: "#FB7185" } : {}),
          },
        ]}
      >
        <Text style={styles.speakerGlyph}>{glyph}</Text>
      </View>
      <Text style={styles.speakerName}>{name.split(" ")[0]}</Text>
      {isSpeaking ? (
        <View style={[styles.speakingIndicator, { backgroundColor: "#FB7185" }]} />
      ) : null}
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
  topic: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    marginTop: 4,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  stage: { flex: 1, alignItems: "center", justifyContent: "center" },
  speakerWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
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
  speakingIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 3,
  },
  waveformSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  waveformRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    height: 30,
  },
  wavebar: { width: 3, borderRadius: 2 },
  recordingTime: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    marginTop: 6,
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: "center",
    gap: 16,
  },
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
  exitHelp: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textAlign: "center",
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 999,
    marginTop: 16,
  },
  createBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
});
