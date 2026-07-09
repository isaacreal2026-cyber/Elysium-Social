import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";
import type { ResonanceKind } from "@/lib/types";

const KIND_META: Record<
  ResonanceKind,
  { label: string; icon: React.ReactNode; color: string }
> = {
  spark: {
    label: "Spark",
    icon: <Feather name="zap" size={15} color="#FFD56B" />,
    color: "#FFD56B",
  },
  flame: {
    label: "Flame",
    icon: <MaterialCommunityIcons name="fire" size={15} color="#FB7185" />,
    color: "#FB7185",
  },
  echo: {
    label: "Echo",
    icon: <Feather name="repeat" size={15} color="#5EEAD4" />,
    color: "#5EEAD4",
  },
  sync: {
    label: "Sync",
    icon: <Feather name="check-circle" size={15} color="#B57BFF" />,
    color: "#B57BFF",
  },
  resonate: {
    label: "Resonate",
    icon: <Feather name="mic" size={15} color="#F472B6" />,
    color: "#F472B6",
  },
  link: {
    label: "Link",
    icon: <Feather name="git-branch" size={15} color="#34D399" />,
    color: "#34D399",
  },
};

const ORDER: ResonanceKind[] = [
  "spark",
  "flame",
  "echo",
  "sync",
  "resonate",
  "link",
];

function format(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

export function ResonanceBar({
  postId,
  energy,
}: {
  postId: string;
  energy: number;
}) {
  const colors = useColors();
  const { posts, resonate, hasResonated } = useResonance();
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;

  return (
    <View>
      <EnergyMeter energy={energy} color={colors.primary} />
      <View style={styles.row}>
        {ORDER.map((k) => {
          const meta = KIND_META[k];
          const active = hasResonated(postId, k);
          return (
            <ResonanceButton
              key={k}
              active={active}
              color={meta.color}
              icon={meta.icon}
              count={post.resonance[k]}
              onPress={() => resonate(postId, k)}
            />
          );
        })}
      </View>
    </View>
  );
}

function ResonanceButton({
  active,
  color,
  icon,
  count,
  onPress,
}: {
  active: boolean;
  color: string;
  icon: React.ReactNode;
  count: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const ring = useSharedValue(0);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.82, { duration: 90 }),
      withTiming(1.08, { duration: 130 }),
      withTiming(1, { duration: 110 }),
    );
    ring.value = 0;
    ring.value = withTiming(1, {
      duration: 650,
      easing: Easing.out(Easing.ease),
    });
    onPress();
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + ring.value * 1.5 }],
    opacity: 1 - ring.value,
  }));

  return (
    <Pressable onPress={handlePress} style={styles.btnWrap}>
      <Animated.View
        style={[
          styles.btn,
          active && { backgroundColor: color + "22", borderColor: color },
          buttonStyle,
        ]}
      >
        <Animated.View
          style={[
            styles.ring,
            { borderColor: color },
            ringStyle,
            { pointerEvents: "none" } as any,
          ]}
        />
        {icon}
        <Text style={[styles.btnLabel, active && { color }]}>
          {format(count)}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function EnergyMeter({ energy, color }: { energy: number; color: string }) {
  const w = useSharedValue(0);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    w.value = withTiming(Math.max(0.02, Math.min(1, energy)), {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [energy, w, shimmer]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${w.value * 100}%` as any,
  }));
  const dotShadow =
    Platform.OS === "web"
      ? ({ boxShadow: `0 0 6px ${color}` } as object)
      : { shadowColor: color, shadowOpacity: 0.9, shadowRadius: 6 };

  const dotStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + shimmer.value * 0.5,
    transform: [{ translateX: shimmer.value * 6 - 3 }],
  }));

  return (
    <View style={styles.meterTrack}>
      <Animated.View
        style={[styles.meterFill, { backgroundColor: color }, fillStyle]}
      />
      <Animated.View
        style={[
          styles.meterDot,
          { backgroundColor: color },
          dotShadow,
          dotStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  btnWrap: {},
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(245,240,255,0.08)",
    backgroundColor: "rgba(245,240,255,0.04)",
    overflow: "hidden",
  },
  ring: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  btnLabel: {
    color: "#A89AC8",
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  meterTrack: {
    height: 3,
    width: "100%",
    backgroundColor: "rgba(245,240,255,0.06)",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 12,
    position: "relative",
  },
  meterFill: { height: "100%", borderRadius: 4 },
  meterDot: {
    position: "absolute",
    right: 0,
    top: -2,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
