import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "@/components/ScreenShell";
import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";

const SECTIONS = [
  { key: "paths", label: "Learn Paths" },
  { key: "library", label: "Library" },
  { key: "video", label: "Video Zone" },
];

const TONES = ["#B57BFF", "#5EEAD4", "#FFD56B"];

export default function GatherScreen() {
  const colors = useColors();
  const { paths, togglePathProgress } = useResonance();
  const [section, setSection] = useState("paths");

  return (
    <ScreenShell title="Gather" subtitle="learn together. think out loud.">
      <View style={styles.tabRow}>
        {SECTIONS.map((s) => {
          const active = s.key === section;
          return (
            <Pressable
              key={s.key}
              onPress={() => setSection(s.key)}
              style={[
                styles.tab,
                {
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.primary + "22" : "rgba(245,240,255,0.04)",
                },
              ]}
            >
              <Text style={[styles.tabText, { color: active ? colors.primary : colors.mutedForeground }]}>{s.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80, gap: 12 }}>
        {section === "paths"
          ? paths.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => togglePathProgress(p.id)}
                style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.tone, { backgroundColor: TONES[p.toneIndex] }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: colors.text }]}>{p.title}</Text>
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>by {p.curator} · {p.modules} modules · {p.category}</Text>
                  <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                    <View style={[styles.progressFill, { width: `${p.progress * 100}%`, backgroundColor: TONES[p.toneIndex] }]} />
                  </View>
                  <Text style={[styles.meta, { color: colors.mutedForeground, marginTop: 4 }]}>
                    {Math.round(p.progress * 100)}% · tap to continue
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </Pressable>
            ))
          : null}

        {section === "library"
          ? LIBRARY.map((item) => (
              <View key={item.title} style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.libIcon, { backgroundColor: colors.primary + "22" }]}>
                  <Feather name="book-open" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.meta, { color: colors.mutedForeground }]} numberOfLines={2}>{item.summary}</Text>
                  <Text style={[styles.meta, { color: colors.gold, marginTop: 4 }]}>
                    {item.minutes} min read · discussed by {item.discussions} people
                  </Text>
                </View>
              </View>
            ))
          : null}

        {section === "video"
          ? VIDEOS.map((v) => (
              <View key={v.title} style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.videoThumb, { backgroundColor: colors.primaryDeep }]}>
                  <Feather name="play" size={18} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: colors.text }]}>{v.title}</Text>
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>{v.creator} · {v.duration}</Text>
                  <Text style={[styles.meta, { color: colors.teal, marginTop: 4 }]}>
                    {v.live ? "live now · " : ""}{v.viewers} watching together
                  </Text>
                </View>
              </View>
            ))
          : null}
      </ScrollView>
    </ScreenShell>
  );
}

const LIBRARY = [
  { title: "On the Architecture of Attention", summary: "How tools shape the rhythm of our days — and what to do about it.", minutes: 14, discussions: 312 },
  { title: "Quiet, A Founder's Manual", summary: "A short field guide to building hard things without losing yourself.", minutes: 9, discussions: 142 },
  { title: "Listening Cities", summary: "What we hear when we stop performing.", minutes: 11, discussions: 78 },
  { title: "Your Network is a Forest", summary: "Why density is more important than reach.", minutes: 7, discussions: 244 },
];

const VIDEOS = [
  { title: "How Aria scores empty rooms", creator: "Aria Volkov", duration: "12:04", live: false, viewers: 1402 },
  { title: "Slow software, live build", creator: "Kenji Park", duration: "ongoing", live: true, viewers: 318 },
  { title: "Walking the corniche", creator: "Noor Hadid", duration: "3:18", live: false, viewers: 882 },
];

const styles = StyleSheet.create({
  tabRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  tabText: { fontFamily: "Inter_600SemiBold", fontSize: 12, letterSpacing: 0.3 },
  row: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tone: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: 2,
  },
  libIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  videoThumb: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  meta: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  progressTrack: { height: 4, borderRadius: 4, marginTop: 8, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
});
