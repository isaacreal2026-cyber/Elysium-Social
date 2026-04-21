import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
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

  const data = [{ id: "create", isCreate: true }, ...stories.map((s) => ({ ...s, isCreate: false as const }))];

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={data as any[]}
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
                <View style={[styles.avatar, { backgroundColor: me?.avatarColor }]}>
                  <Text style={styles.avatarText}>{me?.avatarGlyph}</Text>
                </View>
                <View style={[styles.plusBadge, { backgroundColor: colors.primary }]}>
                  <Feather name="plus" size={10} color="#fff" />
                </View>
              </View>
              <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>your story</Text>
            </Pressable>
          );
        }
        const story = item;
        const author = userById(story.authorId);
        const viewed = isStoryViewed(story.id);
        return (
          <Pressable
            onPress={() => router.push(`/story/${story.id}` as never)}
            style={styles.cell}
          >
            <View
              style={[
                styles.ring,
                viewed ? { borderColor: colors.border } : null,
              ]}
            >
              {!viewed ? (
                <View style={styles.gradientRing}>
                  <View style={[styles.gradientFill, { backgroundColor: colors.primary }]} />
                  <View style={[styles.gradientFill, { backgroundColor: colors.gold, top: -34, left: 28 }]} />
                  <View style={[styles.gradientFill, { backgroundColor: colors.teal, top: 28, left: -28 }]} />
                </View>
              ) : null}
              <Image
                source={NEBULAS[story.toneIndex]}
                style={styles.thumb}
                contentFit="cover"
              />
              <View style={[styles.avatarMini, { backgroundColor: author?.avatarColor }]}>
                <Text style={styles.avatarMiniText}>{author?.avatarGlyph}</Text>
              </View>
            </View>
            <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
              {author?.name?.split(" ")[0]?.toLowerCase() ?? ""}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 12, paddingVertical: 8, gap: 12 },
  cell: { alignItems: "center", width: 72 },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  gradientRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    overflow: "hidden",
  },
  gradientFill: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 30,
    opacity: 0.85,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#0E0524",
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
    borderColor: "#0E0524",
  },
  avatarMiniText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 9 },
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 18 },
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
    borderColor: "#0E0524",
  },
  label: {
    marginTop: 6,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
