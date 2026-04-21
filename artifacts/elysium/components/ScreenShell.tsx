import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomTabBar } from "@/components/BottomTabBar";
import { StarField } from "@/components/StarField";
import { useColors } from "@/hooks/useColors";

interface ScreenShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
  showBack?: boolean;
  density?: number;
  showTabBar?: boolean;
}

export function ScreenShell({
  title,
  subtitle,
  children,
  rightAction,
  showBack = true,
  density = 60,
  showTabBar = true,
}: ScreenShellProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = (isWeb ? Math.max(insets.top, 16) : insets.top) + 8;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#150A2E", "#07021A"]}
        style={StyleSheet.absoluteFill}
      />
      <StarField density={density} seed={title.charCodeAt(0) || 7} />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <View style={styles.headerRow}>
          {showBack ? (
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="chevron-left" size={22} color={colors.text} />
            </Pressable>
          ) : (
            <View style={styles.backBtn} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {subtitle ? <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text> : null}
          </View>
          <View style={styles.rightSlot}>{rightAction}</View>
        </View>
      </View>
      <View style={{ flex: 1 }}>{children}</View>
      {showTabBar ? <BottomTabBar /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(245,240,255,0.06)",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  rightSlot: { minWidth: 36, alignItems: "flex-end" },
});
