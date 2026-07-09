import React, { useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";
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
  group: 0 | 1 | 2;
  drift: number;
}

const STAR_COLORS = [
  "#B57BFF",
  "#5EEAD4",
  "#FFD56B",
  "#F472B6",
  "#FFFFFF",
  "#FFFFFF",
  "#FFFFFF",
];

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
      size: rand() * 2.6 + 0.6,
      opacity: rand() * 0.65 + 0.2,
      color: STAR_COLORS[Math.floor(rand() * STAR_COLORS.length)] ?? "#FFFFFF",
      group: (i % 3) as 0 | 1 | 2,
      drift: rand() * 5 + 3,
    });
  }
  return stars;
}

interface StarFieldProps {
  density?: number;
  seed?: number;
}

export function StarField({ density = 60, seed = 7 }: StarFieldProps) {
  const stars = useMemo(
    () => generate(seed, Math.min(density, 80)),
    [seed, density],
  );

  if (Platform.OS === "web") {
    return (
      <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" } as any]}>
        {stars.map((star, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              left: `${star.x}%` as any,
              top: `${star.y}%` as any,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
              backgroundColor: star.color,
              opacity: star.opacity,
            }}
          />
        ))}
      </View>
    );
  }

  return <AnimatedStarField stars={stars} />;
}

function AnimatedStarField({ stars }: { stars: Star[] }) {
  const va = useSharedValue(0);
  const vb = useSharedValue(0);
  const vc = useSharedValue(0);

  React.useEffect(() => {
    va.value = withRepeat(
      withTiming(1, { duration: 3400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    vb.value = withRepeat(
      withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    vc.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [va, vb, vc]);

  const styleA = useAnimatedStyle(() => ({
    opacity: 0.5 + va.value * 0.5,
    transform: [{ translateY: va.value * 4 - 2 }],
  }));
  const styleB = useAnimatedStyle(() => ({
    opacity: 0.4 + vb.value * 0.6,
    transform: [{ translateY: vb.value * 6 - 3 }],
  }));
  const styleC = useAnimatedStyle(() => ({
    opacity: 0.6 + vc.value * 0.4,
    transform: [{ translateY: vc.value * 3 - 1.5 }],
  }));

  const [groupA, groupB, groupC] = useMemo(() => {
    const a: Star[] = [],
      b: Star[] = [],
      c: Star[] = [];
    stars.forEach((st) => {
      if (st.group === 0) a.push(st);
      else if (st.group === 1) b.push(st);
      else c.push(st);
    });
    return [a, b, c];
  }, [stars]);

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" } as any]}>
      <Animated.View style={[StyleSheet.absoluteFill, styleA]}>
        {groupA.map((star, i) => (
          <StarDot key={i} star={star} />
        ))}
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styleB]}>
        {groupB.map((star, i) => (
          <StarDot key={i} star={star} />
        ))}
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styleC]}>
        {groupC.map((star, i) => (
          <StarDot key={i} star={star} />
        ))}
      </Animated.View>
    </View>
  );
}

function StarDot({ star }: { star: Star }) {
  return (
    <View
      style={{
        position: "absolute",
        left: `${star.x}%` as any,
        top: `${star.y}%` as any,
        width: star.size,
        height: star.size,
        borderRadius: star.size / 2,
        backgroundColor: star.color,
        opacity: star.opacity,
      }}
    />
  );
}
