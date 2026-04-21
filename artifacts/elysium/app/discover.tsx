import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "@/components/ScreenShell";
import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";

const NEBULAS = [
  require("@/assets/images/nebula1.png"),
  require("@/assets/images/nebula2.png"),
  require("@/assets/images/nebula3.png"),
];

export default function DiscoverScreen() {
  const colors = useColors();
  const { stories, hubs, voiceRooms, userById } = useResonance();

  return (
    <ScreenShell title="Discover" subtitle="destinies, voices, hubs">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <SectionLabel title="Destiny Stories" caption="tap to enter a 15-second world" />
        <FlatList
          data={stories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          renderItem={({ item }) => {
            const author = userById(item.authorId);
            return (
              <Pressable style={[styles.story, { borderColor: colors.border }]}>
                <Image source={NEBULAS[item.toneIndex]} style={StyleSheet.absoluteFill} contentFit="cover" />
                <LinearGradient
                  colors={["transparent", "rgba(7,2,26,0.95)"]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.storyTop}>
                  <View style={[styles.storyAvatar, { backgroundColor: author?.avatarColor }]}>
                    <Text style={styles.storyAvatarText}>{author?.avatarGlyph}</Text>
                  </View>
                  <View style={[styles.liveDot, { backgroundColor: colors.gold }]} />
                </View>
                <View style={styles.storyBottom}>
                  <Text style={styles.storyCap} numberOfLines={2}>{item.caption}</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                    {item.destinations.map((d) => (
                      <Text key={d} style={[styles.storyDest, { color: colors.gold }]}>#{d}</Text>
                    ))}
                  </View>
                </View>
              </Pressable>
            );
          }}
        />

        <SectionLabel title="Random Voice Party" caption="enter a small interest-matched room — leave anytime" />
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          <Pressable
            onPress={() => router.push("/voice-party" as never)}
            style={[styles.partyBox, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <LinearGradient
              colors={[colors.primary + "40", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.partyTitle, { color: colors.text }]}>find a voice room</Text>
              <Text style={[styles.partyMeta, { color: colors.mutedForeground }]}>
                4–8 people · interest matched · gentle exit
              </Text>
            </View>
            <View style={[styles.partyAction, { backgroundColor: colors.primary }]}>
              <Feather name="mic" size={20} color="#fff" />
            </View>
          </Pressable>

          {voiceRooms.map((vr) => {
            const host = userById(vr.hostId);
            return (
              <Pressable
                key={vr.id}
                onPress={() => router.push("/voice-party" as never)}
                style={[styles.roomRow, { borderColor: colors.border, backgroundColor: colors.card }]}
              >
                <View style={styles.roomAvatars}>
                  {vr.speakers.slice(0, 3).map((id, i) => {
                    const u = userById(id);
                    return (
                      <View
                        key={id}
                        style={[
                          styles.roomAvatar,
                          { backgroundColor: u?.avatarColor, marginLeft: i === 0 ? 0 : -10, zIndex: 10 - i },
                        ]}
                      >
                        <Text style={styles.roomAvatarText}>{u?.avatarGlyph}</Text>
                      </View>
                    );
                  })}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    {vr.live ? <View style={[styles.liveDot, { backgroundColor: colors.rose }]} /> : null}
                    <Text style={[styles.roomTopic, { color: colors.text }]} numberOfLines={1}>{vr.topic}</Text>
                  </View>
                  <Text style={[styles.roomMeta, { color: colors.mutedForeground }]}>
                    hosted by {host?.name} · {vr.vibe} · {vr.listeners} listening
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </Pressable>
            );
          })}
        </View>

        <SectionLabel title="Trending Hubs" caption="where conversations are humming right now" />
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          {hubs.slice(0, 3).map((h) => (
            <Pressable
              key={h.id}
              onPress={() => router.push(`/hub/${h.id}` as never)}
              style={[styles.hubRow, { borderColor: colors.border, backgroundColor: colors.card }]}
            >
              <Image source={NEBULAS[h.toneIndex]} style={styles.hubThumb} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.hubName, { color: colors.text }]}>{h.name}</Text>
                <Text style={[styles.hubLine, { color: colors.mutedForeground }]} numberOfLines={1}>{h.tagline}</Text>
                <View style={styles.hubStats}>
                  <Text style={[styles.hubStat, { color: colors.teal }]}>{(h.members / 1000).toFixed(1)}k members</Text>
                  <Text style={[styles.hubStat, { color: colors.gold }]}>pulse {Math.round(h.pulse * 100)}</Text>
                  <Text style={[styles.hubStat, { color: colors.magenta }]}>{h.online.length} orbiting</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

function SectionLabel({ title, caption }: { title: string; caption: string }) {
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCaption}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { color: "#F5F0FF", fontFamily: "Inter_700Bold", fontSize: 16, letterSpacing: -0.3 },
  sectionCaption: { color: "#A89AC8", fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  story: {
    width: 130,
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
  },
  storyTop: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  storyAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
  },
  storyAvatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 12 },
  liveDot: { width: 7, height: 7, borderRadius: 4, shadowColor: "#FFD56B", shadowOpacity: 1, shadowRadius: 6 },
  storyBottom: { position: "absolute", bottom: 12, left: 12, right: 12 },
  storyCap: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 13, lineHeight: 17 },
  storyDest: { fontSize: 10, fontFamily: "Inter_500Medium" },
  partyBox: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    overflow: "hidden",
  },
  partyTitle: { fontFamily: "Inter_700Bold", fontSize: 18, letterSpacing: -0.3 },
  partyMeta: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4 },
  partyAction: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  roomRow: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  roomAvatars: { flexDirection: "row" },
  roomAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#150A2E",
  },
  roomAvatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 12 },
  roomTopic: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  roomMeta: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 },
  hubRow: {
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  hubThumb: { width: 56, height: 56, borderRadius: 14 },
  hubName: { fontFamily: "Inter_700Bold", fontSize: 14 },
  hubLine: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  hubStats: { flexDirection: "row", gap: 12, marginTop: 6 },
  hubStat: { fontFamily: "Inter_500Medium", fontSize: 11 },
});
