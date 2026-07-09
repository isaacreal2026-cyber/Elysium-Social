import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";

import { ScreenShell } from "@/components/ScreenShell";
import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";

const NEBULAS = [
  require("@/assets/images/nebula1.png"),
  require("@/assets/images/nebula2.png"),
  require("@/assets/images/nebula3.png"),
];

export default function GroupsScreen() {
  const colors = useColors();
  const { hubs, userById } = useResonance();

  return (
    <ScreenShell
      title="Nexus Hubs"
      subtitle="spatial groups · members orbit live"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 80, gap: 14 }}
      >
        {hubs.map((h) => (
          <Pressable
            key={h.id}
            onPress={() => router.push(`/hub/${h.id}` as never)}
            style={[
              styles.card,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <Image
              source={NEBULAS[h.toneIndex]}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
            <LinearGradient
              colors={["rgba(7,2,26,0.4)", "rgba(7,2,26,0.95)"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.cardInner}>
              <View style={styles.cardTop}>
                {h.projectMode ? (
                  <View
                    style={[
                      styles.projectChip,
                      {
                        borderColor: colors.teal,
                        backgroundColor: colors.teal + "22",
                      },
                    ]}
                  >
                    <Feather name="layers" size={10} color={colors.teal} />
                    <Text
                      style={[styles.projectChipText, { color: colors.teal }]}
                    >
                      PROJECT MODE
                    </Text>
                  </View>
                ) : (
                  <View />
                )}
                <View style={styles.pulse}>
                  <View
                    style={[styles.pulseDot, { backgroundColor: colors.gold }]}
                  />
                  <Text style={styles.pulseText}>
                    pulse {Math.round(h.pulse * 100)}
                  </Text>
                </View>
              </View>
              <Text style={styles.hubName}>{h.name}</Text>
              <Text style={styles.hubTagline}>{h.tagline}</Text>
              <View style={styles.orbitRow}>
                {h.online.slice(0, 6).map((id, i) => {
                  const u = userById(id);
                  return (
                    <View
                      key={id}
                      style={[
                        styles.orbitAvatar,
                        {
                          backgroundColor: u?.avatarColor,
                          marginLeft: i === 0 ? 0 : -10,
                          zIndex: 10 - i,
                        },
                      ]}
                    >
                      <Text style={styles.orbitAvatarText}>
                        {u?.avatarGlyph}
                      </Text>
                    </View>
                  );
                })}
                <Text style={styles.orbitMeta}>
                  {h.online.length} orbiting · {(h.members / 1000).toFixed(1)}k
                  members
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    height: 200,
    overflow: "hidden",
  },
  cardInner: { padding: 16, flex: 1, justifyContent: "space-between" },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projectChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  projectChipText: {
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    letterSpacing: 1,
  },
  pulse: { flexDirection: "row", alignItems: "center", gap: 6 },
  pulseDot: { width: 6, height: 6, borderRadius: 3 },
  pulseText: {
    color: "#F5F0FF",
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.4,
  },
  hubName: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: -0.4,
  },
  hubTagline: {
    color: "#A89AC8",
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 2,
  },
  orbitRow: { flexDirection: "row", alignItems: "center" },
  orbitAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0E0524",
  },
  orbitAvatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 11 },
  orbitMeta: {
    color: "#A89AC8",
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginLeft: 10,
  },
});
