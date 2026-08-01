import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { PostCard } from "@/components/PostCard";
import { ScreenShell } from "@/components/ScreenShell";
import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";
import { useServices } from "@/context/ServicesProvider";

const ORBITAL_FEEDS = [
  { key: "vibe", label: "Vibe", icon: "activity" as const },
  { key: "moments", label: "Moments", icon: "clock" as const },
  { key: "memories", label: "Memories", icon: "rotate-ccw" as const },
  { key: "events", label: "Events", icon: "calendar" as const },
  { key: "friends", label: "Friends", icon: "users" as const },
  { key: "learning", label: "Learning", icon: "book" as const },
  { key: "geo", label: "Geo Pulse", icon: "map-pin" as const },
];

export default function FeedScreen() {
  const colors = useColors();
  const { posts } = useResonance();
  const services = useServices();
  const [active, setActive] = useState("vibe");

  const ranked = useMemo(() => {
    const sorted = [...posts];
    if (active === "vibe") {
      // Use Resonance Engine for "Vibe" tab — smart ranking
      if (services.rankedPosts.length > 0) {
        return services.rankedPosts.map((r) => r.post);
      }
      sorted.sort((a, b) => b.energy - a.energy);
    }
    else if (active === "moments")
      sorted.sort((a, b) => b.createdAt - a.createdAt);
    else if (active === "memories")
      sorted.sort((a, b) => a.createdAt - b.createdAt);
    else if (active === "friends")
      sorted.sort((a, b) => b.resonance.sync - a.resonance.sync);
    else if (active === "learning")
      return sorted.filter(
        (p) => p.kind === "question" || p.kind === "project",
      );
    else if (active === "events")
      return sorted.filter((p) => p.kind === "project" || p.kind === "destiny");
    else if (active === "geo")
      sorted.sort((a, b) => b.resonance.spark - a.resonance.spark);
    return sorted;
  }, [active, posts, services.rankedPosts]);

  return (
    <ScreenShell title="Feed" subtitle="swipe through orbital streams">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRow}
      >
        {ORBITAL_FEEDS.map((f) => {
          const isActive = active === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setActive(f.key)}
              style={[
                styles.tab,
                {
                  borderColor: isActive ? colors.primary : colors.border,
                  backgroundColor: isActive
                    ? colors.primary + "22"
                    : "rgba(245,240,255,0.04)",
                },
              ]}
            >
              <Feather
                name={f.icon}
                size={13}
                color={isActive ? colors.primary : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? colors.primary : colors.mutedForeground },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <FlatList
        data={ranked}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 60,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 80 }}>
            <Feather name="wind" size={28} color={colors.mutedForeground} />
            <Text
              style={{
                color: colors.mutedForeground,
                marginTop: 12,
                fontFamily: "Inter_500Medium",
              }}
            >
              this stream is quiet right now
            </Text>
          </View>
        }
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
});
