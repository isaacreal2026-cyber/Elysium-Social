import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
}

const STAR_COLORS = ["#B57BFF", "#5EEAD4", "#FFD56B", "#F472B6", "#FFFFFF"];

function generate(seed: number, count: number): Star[] {
  const stars: Star[] = [];
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < count; i++) {
    stars.push({
      x: rand() * 100,
      y: rand() * 100,
      size: rand() * 2.4 + 0.6,
      opacity: rand() * 0.7 + 0.2,
      color: STAR_COLORS[Math.floor(rand() * STAR_COLORS.length)] ?? "#FFFFFF",
    });
  }
  return stars;
}

interface StarFieldProps {
  density?: number;
  seed?: number;
  drift?: boolean;
}

export function StarField({ density = 80, seed = 7, drift = true }: StarFieldProps) {
  const stars = useMemo(() => generate(seed, density), [seed, density]);
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [shimmer]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {stars.map((star, i) => (
        <Twinkle key={i} star={star} drift={drift} index={i} />
      ))}
    </View>
  );
}

function Twinkle({ star, drift, index }: { star: Star; drift: boolean; index: number }) {
  const t = useSharedValue(0);
  React.useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 2200 + (index % 7) * 300, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [t, index]);

  const style = useAnimatedStyle(() => ({
    opacity: star.opacity * (0.4 + t.value * 0.6),
    transform: drift ? [{ translateY: t.value * 6 - 3 }] : [],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: `${star.x}%`,
          top: `${star.y}%`,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          backgroundColor: star.color,
          shadowColor: star.color,
          shadowOpacity: 0.9,
          shadowRadius: star.size * 2,
        },
        style,
      ]}
    />
  );
}
