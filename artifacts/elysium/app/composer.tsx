import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";
import type { Post } from "@/lib/types";

const KINDS: {
  key: Post["kind"];
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
}[] = [
  { key: "classic", label: "Note", icon: "feather" },
  { key: "voice", label: "Voice", icon: "mic" },
  { key: "destiny", label: "Destiny", icon: "navigation" },
  { key: "project", label: "Project", icon: "layers" },
  { key: "poll", label: "Poll", icon: "bar-chart-2" },
  { key: "question", label: "Question", icon: "help-circle" },
];

const SUGGESTED = [
  "Sound",
  "Healing",
  "Founders",
  "Travel",
  "Dev",
  "Poetry",
  "Sleep",
  "Berlin",
  "Lisbon",
];

export default function ComposerScreen() {
  const params = useLocalSearchParams<{ kind?: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addPost, addStory } = useResonance();
  const initialKind =
    params.kind &&
    KINDS.some((k) => k.key === params.kind)
      ? (params.kind as Post["kind"])
      : "classic";
  const [kind, setKind] = useState<Post["kind"]>(initialKind);
  const [body, setBody] = useState("");
  const [destinations, setDestinations] = useState<string[]>([]);

  const submit = () => {
    if (!body.trim()) return;
    if (kind === "destiny") {
      addStory({ caption: body.trim(), destinations });
    } else {
      addPost({ body: body.trim(), kind, destinations });
    }
    router.back();
  };

  const toggleDest = (d: string) => {
    setDestinations((cur) =>
      cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d],
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.handle, { marginTop: insets.top + 8 }]} />
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="x" size={20} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          compose
        </Text>
        <Pressable
          onPress={submit}
          disabled={!body.trim()}
          style={[
            styles.sendBtn,
            { backgroundColor: body.trim() ? colors.primary : colors.border },
          ]}
        >
          <Text style={styles.sendText}>release</Text>
        </Pressable>
      </View>

      <KeyboardAwareScrollView
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 80, gap: 16 }}
      >
        <View style={styles.kindRow}>
          {KINDS.map((k) => {
            const active = k.key === kind;
            return (
              <Pressable
                key={k.key}
                onPress={() => setKind(k.key)}
                style={[
                  styles.kindChip,
                  {
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active
                      ? colors.primary + "22"
                      : "rgba(245,240,255,0.04)",
                  },
                ]}
              >
                <Feather
                  name={k.icon}
                  size={13}
                  color={active ? colors.primary : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.kindText,
                    { color: active ? colors.primary : colors.mutedForeground },
                  ]}
                >
                  {k.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          style={[
            styles.editor,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <TextInput
            value={body}
            onChangeText={setBody}
            multiline
            placeholder={
              kind === "voice"
                ? "describe your voice note (we'd record it on a real device) — what's underneath the moment?"
                : kind === "destiny"
                  ? "the moment, in 1–2 sentences. you'll tag where it should travel below."
                  : "what's resonating right now?"
            }
            placeholderTextColor={colors.subtle}
            style={[styles.input, { color: colors.text }]}
          />
        </View>

        <View>
          <Text
            style={[styles.sectionLabel, { color: colors.mutedForeground }]}
          >
            DESTINATIONS · where this should travel
          </Text>
          <View style={styles.destRow}>
            {SUGGESTED.map((d) => {
              const active = destinations.includes(d);
              return (
                <Pressable
                  key={d}
                  onPress={() => toggleDest(d)}
                  style={[
                    styles.dest,
                    {
                      borderColor: active ? colors.gold : colors.border,
                      backgroundColor: active
                        ? colors.gold + "22"
                        : "rgba(245,240,255,0.04)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.destText,
                      { color: active ? colors.gold : colors.mutedForeground },
                    ]}
                  >
                    {active ? "↗ " : "+ "}
                    {d}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {kind === "voice" ? (
          <View
            style={[
              styles.voicePanel,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <View style={[styles.voiceCircle, { borderColor: colors.primary }]}>
              <Feather name="mic" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.voiceLabel, { color: colors.text }]}>
              tap to record
            </Text>
            <Text style={[styles.voiceHint, { color: colors.mutedForeground }]}>
              up to 60s · auto-transcribed for accessibility
            </Text>
          </View>
        ) : null}

        <View style={[styles.tip, { borderColor: colors.border }]}>
          <Feather name="info" size={12} color={colors.teal} />
          <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
            Resonance Engine will quietly nudge this to people whose energy
            aligns. You can see who at any time.
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(245,240,255,0.18)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(245,240,255,0.06)",
  },
  headerTitle: { flex: 1, fontFamily: "Inter_700Bold", fontSize: 18 },
  sendBtn: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
  kindRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  kindChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  kindText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.3,
  },
  editor: { padding: 16, borderRadius: 18, borderWidth: 1, minHeight: 160 },
  input: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    lineHeight: 24,
    minHeight: 130,
    textAlignVertical: "top",
  },
  sectionLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  destRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  dest: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  destText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  voicePanel: {
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  voiceCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  voiceHint: { fontFamily: "Inter_400Regular", fontSize: 12 },
  tip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  tipText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
});
