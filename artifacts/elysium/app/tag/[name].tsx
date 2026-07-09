import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { PostCard } from "@/components/PostCard";
import { ScreenShell } from "@/components/ScreenShell";
import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";

export default function TagScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const colors = useColors();
  const { posts, trending } = useResonance();
  const tagInfo = trending.find(
    (t) => t.tag.toLowerCase() === (name ?? "").toLowerCase(),
  );
  const matched = useMemo(
    () =>
      posts.filter((p) =>
        p.destinations?.some(
          (d) => d.toLowerCase() === (name ?? "").toLowerCase(),
        ),
      ),
    [posts, name],
  );

  return (
    <ScreenShell
      title={`#${name}`}
      subtitle={
        tagInfo
          ? `${tagInfo.posts.toLocaleString()} posts · trending ↑${Math.round(tagInfo.delta * 100)}%`
          : "destination feed"
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 130 }}
      >
        {matched.length === 0 ? (
          <View style={styles.empty}>
            <Feather
              name="navigation"
              size={28}
              color={colors.mutedForeground}
            />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              no echoes here yet — be the first
            </Text>
          </View>
        ) : (
          matched.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  empty: { paddingTop: 80, alignItems: "center", gap: 10 },
  emptyText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    textAlign: "center",
  },
});
