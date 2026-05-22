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
  density = 50,
  showTabBar = true,
}: ScreenShellProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = (Platform.OS === "web" ? Math.max(insets.top, 16) : insets.top) + 10;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient colors={["#160B30", "#07021A"]} style={StyleSheet.absoluteFill} />
      <StarField density={density} seed={title.charCodeAt(0) || 7} />

      <View style={[styles.header, { paddingTop: topPad }]}>
        <View style={styles.row}>
          {showBack ? (
            <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: "rgba(245,240,255,0.06)", borderColor: colors.border }]}>
              <Feather name="chevron-left" size={20} color={colors.text} />
            </Pressable>
          ) : (
            <View style={styles.backBtn} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {subtitle ? (
              <Text style={[styles.subtitle, { color: colors.subtle }]}>{subtitle}</Text>
            ) : null}
          </View>
          <View style={styles.right}>{rightAction ?? <View style={{ width: 36 }} />}</View>
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
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 1,
  },
  right: { minWidth: 34, alignItems: "flex-end", flexShrink: 0 },
});
