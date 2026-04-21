import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, usePathname } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";

export type TabKey = "home" | "search" | "compose" | "notifications" | "me";

interface TabDef {
  key: TabKey;
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  route: string;
  match: (path: string) => boolean;
}

const TABS: TabDef[] = [
  { key: "home", icon: "home", label: "Home", route: "/", match: (p) => p === "/" || p.startsWith("/feed") || p.startsWith("/discover") },
  { key: "search", icon: "search", label: "Search", route: "/search", match: (p) => p.startsWith("/search") },
  { key: "compose", icon: "plus", label: "Create", route: "/composer", match: () => false },
  { key: "notifications", icon: "bell", label: "Activity", route: "/notifications", match: (p) => p.startsWith("/notifications") },
  { key: "me", icon: "user", label: "Me", route: "/me", match: (p) => p === "/me" || p.startsWith("/profile") },
];

export function BottomTabBar() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { unreadNotifications, unreadMessages } = useResonance();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <LinearGradient
        colors={["transparent", "rgba(7,2,26,0.9)", "#07021A"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View
        style={[
          styles.bar,
          {
            backgroundColor: "rgba(23,10,46,0.92)",
            borderColor: colors.border,
            ...(Platform.OS === "web"
              ? ({ boxShadow: "0 -8px 32px rgba(7,2,26,0.6)" } as object)
              : {
                  shadowColor: "#000",
                  shadowOpacity: 0.5,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: -4 },
                }),
          },
        ]}
      >
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          const isCompose = tab.key === "compose";
          const badge =
            tab.key === "notifications" ? unreadNotifications : tab.key === "home" ? unreadMessages : 0;
          return (
            <Pressable
              key={tab.key}
              onPress={() => router.push(tab.route as never)}
              style={styles.tabBtn}
            >
              {isCompose ? (
                <LinearGradient
                  colors={[colors.primary, colors.magenta]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.composeBtn}
                >
                  <Feather name="plus" size={22} color="#fff" />
                </LinearGradient>
              ) : (
                <View style={styles.iconWrap}>
                  <Feather
                    name={tab.icon}
                    size={22}
                    color={active ? colors.primary : colors.mutedForeground}
                  />
                  {badge > 0 ? (
                    <View style={[styles.badge, { backgroundColor: colors.rose }]}>
                      <Text style={styles.badgeText}>{badge > 9 ? "9+" : badge}</Text>
                    </View>
                  ) : null}
                </View>
              )}
              {!isCompose ? (
                <Text
                  style={[
                    styles.label,
                    { color: active ? colors.primary : colors.mutedForeground },
                  ]}
                >
                  {tab.label}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: 24,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 28,
    borderWidth: 1,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 4,
  },
  iconWrap: { position: "relative" },
  composeBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: -8,
    ...(Platform.OS === "web"
      ? ({ boxShadow: "0 6px 18px rgba(181,123,255,0.6)" } as object)
      : {
          shadowColor: "#B57BFF",
          shadowOpacity: 0.7,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 4 },
        }),
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 9 },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 0.2,
  },
});
