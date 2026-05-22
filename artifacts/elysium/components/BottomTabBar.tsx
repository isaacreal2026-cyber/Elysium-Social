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
  { key: "home", icon: "home", label: "Home", route: "/", match: (p) => p === "/" || p === "/feed" || p === "/discover" },
  { key: "search", icon: "search", label: "Search", route: "/search", match: (p) => p.startsWith("/search") },
  { key: "compose", icon: "plus", label: "Create", route: "/composer", match: () => false },
  { key: "notifications", icon: "bell", label: "Activity", route: "/notifications", match: (p) => p.startsWith("/notifications") },
  { key: "me", icon: "user", label: "Me", route: "/me", match: (p) => p === "/me" || p.startsWith("/profile") },
];

const composeBtnShadow = Platform.OS === "web"
  ? ({ boxShadow: "0 6px 18px rgba(181,123,255,0.55)" } as object)
  : { shadowColor: "#B57BFF", shadowOpacity: 0.65, shadowRadius: 14, shadowOffset: { width: 0, height: 4 } };

const barShadow = Platform.OS === "web"
  ? ({ boxShadow: "0 -8px 32px rgba(7,2,26,0.7)" } as object)
  : { shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: -4 } };

export function BottomTabBar() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { unreadNotifications, unreadMessages } = useResonance();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <LinearGradient
        colors={["transparent", "rgba(7,2,26,0.88)", "#07021A"]}
        style={[StyleSheet.absoluteFill, { pointerEvents: "none" } as any]}
      />
      <View style={[styles.bar, { backgroundColor: "rgba(21,10,46,0.94)", borderColor: colors.border }, barShadow]}>
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
                  style={[styles.composeBtn, composeBtnShadow]}
                >
                  <Feather name="plus" size={22} color="#fff" />
                </LinearGradient>
              ) : (
                <View style={styles.iconWrap}>
                  <View style={[styles.iconInner, active && { backgroundColor: colors.primary + "18" }]}>
                    <Feather
                      name={tab.icon}
                      size={20}
                      color={active ? colors.primary : colors.mutedForeground}
                    />
                  </View>
                  {badge > 0 ? (
                    <View style={[styles.badge, { backgroundColor: colors.rose }]}>
                      <Text style={styles.badgeText}>{badge > 9 ? "9+" : badge}</Text>
                    </View>
                  ) : null}
                </View>
              )}
              {!isCompose ? (
                <Text style={[styles.label, { color: active ? colors.primary : colors.mutedForeground }]}>
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
    paddingHorizontal: 10,
    paddingTop: 20,
    pointerEvents: "box-none",
  } as any,
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 26,
    borderWidth: 1,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 2,
    minHeight: 46,
  },
  iconWrap: { position: "relative", alignItems: "center", justifyContent: "center" },
  iconInner: {
    width: 38,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  composeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: -6,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
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
