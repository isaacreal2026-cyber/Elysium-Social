import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";

const NEBULAS = [
  require("@/assets/images/nebula1.png"),
  require("@/assets/images/nebula2.png"),
  require("@/assets/images/nebula3.png"),
];

export function StoryRail() {
  const colors = useColors();
  const { stories, userById, selfId, isStoryViewed } = useResonance();
  const me = userById(selfId);

  const items: Array<{ id: string; isCreate: boolean } | (typeof stories[number] & { isCreate: false })> = [
    { id: "__create__", isCreate: true },
    ...stories.map((s) => ({ ...s, isCreate: false as const })),
  ];

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.row}
      renderItem={({ item }) => {
        if (item.isCreate) {
          return (
            <Pressable
              onPress={() => router.push({ pathname: "/composer", params: { kind: "destiny" } } as never)}
              style={styles.cell}
            >
              <View style={[styles.createRing, { borderColor: colors.border }]}>
                <View style={[styles.createAvatar, { backgroundColor: me?.avatarColor }]}>
                  <Text style={styles.createAvatarText}>{me?.avatarGlyph}</Text>
                </View>
                <View style={[styles.plusBadge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
                  <Feather name="plus" size={9} color="#fff" />
                </View>
              </View>
              <Text style={[styles.label, { color: colors.mutedForeground }]} numberOfLines={1}>
                your story
              </Text>
            </Pressable>
          );
        }

        const story = item as typeof stories[number];
        const author = userById(story.authorId);
        const viewed = isStoryViewed(story.id);

        return (
          <Pressable
            onPress={() => router.push(`/story/${story.id}` as never)}
            style={styles.cell}
          >
            <View style={styles.ringWrap}>
              {!viewed ? (
                <LinearGradient
                  colors={[colors.primary, colors.gold, colors.teal]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientRing}
                />
              ) : (
                <View style={[styles.gradientRing, { backgroundColor: colors.border }]} />
              )}
              <View style={[styles.ringInner, { backgroundColor: colors.background }]}>
                <Image
                  source={NEBULAS[story.toneIndex % 3]}
                  style={styles.thumb}
                  contentFit="cover"
                />
              </View>
              <View style={[styles.avatarMini, { backgroundColor: author?.avatarColor, borderColor: colors.background }]}>
                <Text style={styles.avatarMiniText}>{author?.avatarGlyph}</Text>
              </View>
            </View>
            <Text style={[styles.label, { color: viewed ? colors.subtle : colors.text }]} numberOfLines={1}>
              {author?.name?.split(" ")[0]?.toLowerCase() ?? ""}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 14, paddingVertical: 10, gap: 12 },
  cell: { alignItems: "center", width: 68 },
  ringWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  gradientRing: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  ringInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarMini: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  avatarMiniText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 8 },
  createRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  createAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  createAvatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 20 },
  plusBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  label: {
    marginTop: 6,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
