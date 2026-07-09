import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";

const NEBULAS = [
  require("@/assets/images/nebula1.png"),
  require("@/assets/images/nebula2.png"),
  require("@/assets/images/nebula3.png"),
];

const STORY_DURATION = 6000;

export default function StoryViewer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { stories, userById, markStoryViewed, resonate } = useResonance();
  const [reply, setReply] = useState("");

  const startIndex = Math.max(
    0,
    stories.findIndex((s) => s.id === id),
  );
  const [index, setIndex] = useState(startIndex);
  const story = stories[index];

  const progress = useSharedValue(0);

  useEffect(() => {
    if (!story) return;
    progress.value = 0;
    progress.value = withTiming(
      1,
      { duration: STORY_DURATION, easing: Easing.linear },
      (finished) => {
        "worklet";
        if (finished) {
          // advance handled by setTimeout below
        }
      },
    );
    markStoryViewed(story.id);
    const t = setTimeout(() => {
      if (index < stories.length - 1) {
        setIndex((i) => i + 1);
      } else {
        router.back();
      }
    }, STORY_DURATION);
    return () => clearTimeout(t);
  }, [story, index, stories.length, progress, markStoryViewed]);

  if (!story) {
    return (
      <View
        style={[
          styles.root,
          {
            backgroundColor: colors.background,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Text style={{ color: colors.text }}>Story not found</Text>
      </View>
    );
  }

  const author = userById(story.authorId);
  const tap = (side: "left" | "right") => {
    if (side === "left") {
      if (index > 0) setIndex(index - 1);
    } else {
      if (index < stories.length - 1) setIndex(index + 1);
      else router.back();
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: "#000" }]}>
      <Image
        source={NEBULAS[story.toneIndex]}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <LinearGradient
        colors={["rgba(7,2,26,0.85)", "rgba(7,2,26,0.1)", "rgba(7,2,26,0.95)"]}
        style={StyleSheet.absoluteFill}
        locations={[0, 0.4, 1]}
      />

      <View style={[styles.tapZones, { pointerEvents: "box-none" } as any]}>
        <Pressable onPress={() => tap("left")} style={styles.tapLeft} />
        <Pressable onPress={() => tap("right")} style={styles.tapRight} />
      </View>

      <View style={[styles.top, { paddingTop: insets.top + 10 }]}>
        <View style={styles.progressRow}>
          {stories.map((_, i) => (
            <ProgressBar
              key={i}
              active={i === index}
              done={i < index}
              progress={progress}
            />
          ))}
        </View>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.push(`/profile/${author?.id}` as never)}
            style={styles.authorRow}
          >
            <View
              style={[styles.avatar, { backgroundColor: author?.avatarColor }]}
            >
              <Text style={styles.avatarText}>{author?.avatarGlyph}</Text>
            </View>
            <View>
              <Text style={styles.authorName}>{author?.name}</Text>
              <Text style={styles.authorMeta}>
                {Math.floor((Date.now() - story.createdAt) / 60000)}m ·{" "}
                {story.viewers.toLocaleString()} viewers
              </Text>
            </View>
          </Pressable>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Feather name="x" size={22} color="#fff" />
          </Pressable>
        </View>
      </View>

      <View style={styles.middle}>
        <Text style={styles.caption}>{story.caption}</Text>
        <View style={styles.destRow}>
          {story.destinations.map((d) => (
            <View key={d} style={styles.destChip}>
              <Feather name="navigation" size={11} color="#FFD56B" />
              <Text style={styles.destChipText}>#{d}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 14 }]}>
        <View style={styles.replyBar}>
          <TextInput
            value={reply}
            onChangeText={setReply}
            placeholder={`reply to ${author?.name?.split(" ")[0]?.toLowerCase()}…`}
            placeholderTextColor="rgba(245,240,255,0.6)"
            style={styles.replyInput}
          />
        </View>
        <View style={styles.reactRow}>
          <ReactionBtn icon="zap" color="#FFD56B" onPress={() => {}} />
          <ReactionBtn icon="heart" color="#FB7185" onPress={() => {}} />
          <ReactionBtn icon="mic" color="#5EEAD4" onPress={() => {}} />
          <ReactionBtn
            icon="send"
            color="#B57BFF"
            onPress={() => router.push(`/post/${story.id}` as never)}
          />
        </View>
      </View>
    </View>
  );
}

function ProgressBar({
  active,
  done,
  progress,
}: {
  active: boolean;
  done: boolean;
  progress: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => ({
    width: done ? "100%" : active ? `${progress.value * 100}%` : "0%",
  }));
  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, style]} />
    </View>
  );
}

function ReactionBtn({
  icon,
  color,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.reactBtn,
        { borderColor: color, backgroundColor: color + "22" },
      ]}
    >
      <Feather name={icon} size={18} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tapZones: { ...StyleSheet.absoluteFillObject, flexDirection: "row" },
  tapLeft: { flex: 1 },
  tapRight: { flex: 2 },
  top: { paddingHorizontal: 12 },
  progressRow: { flexDirection: "row", gap: 4, marginBottom: 12 },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#fff", borderRadius: 2 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  avatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14 },
  authorName: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14 },
  authorMeta: {
    color: "rgba(245,240,255,0.7)",
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  middle: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  caption: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    lineHeight: 36,
    textAlign: "center",
    letterSpacing: -0.4,
  },
  destRow: { flexDirection: "row", gap: 8, marginTop: 18 },
  destChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(7,2,26,0.5)",
    borderWidth: 1,
    borderColor: "rgba(255,213,107,0.5)",
  },
  destChipText: {
    color: "#FFD56B",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  bottom: { paddingHorizontal: 16, gap: 12 },
  replyBar: {
    paddingHorizontal: 16,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "rgba(245,240,255,0.3)",
    backgroundColor: "rgba(7,2,26,0.4)",
    flexDirection: "row",
    alignItems: "center",
  },
  replyInput: {
    flex: 1,
    color: "#fff",
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  reactRow: { flexDirection: "row", justifyContent: "center", gap: 14 },
  reactBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
