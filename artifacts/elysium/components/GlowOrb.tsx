import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Platform, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface GlowOrbProps {
  size: number;
  colors?: [string, string, ...string[]];
  glyph?: string;
  label?: string;
  pulse?: boolean;
  intensity?: number;
  style?: ViewStyle;
}

const shadow = (color: string, radius: number) =>
  Platform.OS === "web"
    ? ({ boxShadow: `0 0 ${radius}px ${color}88` } as object)
    : {
        shadowColor: color,
        shadowOpacity: 0.8,
        shadowRadius: radius,
        shadowOffset: { width: 0, height: 0 },
        elevation: 12,
      };

export function GlowOrb({
  size,
  colors = ["#B57BFF", "#5EEAD4"],
  glyph,
  label,
  pulse = true,
  intensity = 1,
  style,
}: GlowOrbProps) {
  const breath = useSharedValue(0);

  useEffect(() => {
    if (!pulse) return;
    breath.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse, breath]);

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breath.value * 0.18 * intensity }],
    opacity: 0.45 + breath.value * 0.35 * intensity,
  }));

  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breath.value * 0.05 }],
  }));

  return (
    <View style={[{ alignItems: "center", justifyContent: "center", width: size * 1.6, height: size * 1.6 }, style]}>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: size * 1.6,
            height: size * 1.6,
            borderRadius: size,
            backgroundColor: colors[0],
            opacity: 0.22,
          },
          haloStyle,
        ]}
      />
      <Animated.View style={innerStyle}>
        <LinearGradient
          colors={colors}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 0.9, y: 0.9 }}
          style={[
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              alignItems: "center",
              justifyContent: "center",
            },
            shadow(colors[0], size * 0.4),
          ]}
        >
          <View
            style={{
              position: "absolute",
              top: size * 0.12,
              left: size * 0.18,
              width: size * 0.34,
              height: size * 0.18,
              borderRadius: size * 0.18,
              backgroundColor: "rgba(255,255,255,0.55)",
              opacity: 0.65,
              transform: [{ rotate: "-20deg" }],
            }}
          />
          {glyph ? (
            <Text style={[styles.glyph, { fontSize: size * 0.4 }]}>{glyph}</Text>
          ) : null}
        </LinearGradient>
      </Animated.View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  glyph: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  label: {
    position: "absolute",
    bottom: -22,
    color: "#F5F0FF",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
  },
});
