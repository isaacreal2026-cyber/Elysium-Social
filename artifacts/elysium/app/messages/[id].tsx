import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

import { ScreenShell } from "@/components/ScreenShell";
import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";

export default function MessageThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { threads, chats, userById, selfId, sendMessage } = useResonance();
  const [draft, setDraft] = useState("");

  const thread = threads.find((t) => t.id === id);
  const messages = chats[id ?? ""] ?? [];
  const otherId = thread?.participantIds.find((p) => p !== selfId);
  const other = otherId ? userById(otherId) : null;

  const send = () => {
    if (!draft.trim() || !id) return;
    sendMessage(id, draft.trim());
    setDraft("");
  };

  return (
    <ScreenShell
      title={other?.name ?? "Thread"}
      subtitle={
        other
          ? `${other.handle} · ${other.online ? "tuned in now" : "drifting"}`
          : undefined
      }
      rightAction={
        <Pressable
          style={[
            styles.callBtn,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <Feather name="mic" size={16} color={colors.teal} />
        </Pressable>
      }
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.projectBanner, { borderColor: colors.border }]}>
          <Feather name="layers" size={12} color={colors.teal} />
          <Text style={[styles.projectText, { color: colors.text }]}>
            <Text
              style={{ color: colors.teal, fontFamily: "Inter_600SemiBold" }}
            >
              project mode
            </Text>
            <Text style={{ color: colors.mutedForeground }}>
              {" "}
              · shared canvas, voice notes, tasks
            </Text>
          </Text>
          <Feather
            name="chevron-right"
            size={14}
            color={colors.mutedForeground}
          />
        </View>

        <FlatList
          data={[...messages].reverse()}
          inverted
          keyExtractor={(m) => m.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 10,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          renderItem={({ item }) => {
            const mine = item.authorId === selfId;
            return (
              <View
                style={[styles.bubbleWrap, mine && { alignItems: "flex-end" }]}
              >
                <View
                  style={[
                    styles.bubble,
                    {
                      backgroundColor: mine ? colors.primary : colors.card,
                      borderColor: colors.border,
                      borderTopRightRadius: mine ? 4 : 18,
                      borderTopLeftRadius: mine ? 18 : 4,
                    },
                  ]}
                >
                  {item.voiceSeconds ? (
                    <View style={styles.voiceBubble}>
                      <Feather
                        name="play"
                        size={14}
                        color={mine ? "#fff" : colors.text}
                      />
                      <View style={styles.voiceWaveform}>
                        {Array.from({ length: 18 }).map((_, i) => (
                          <View
                            key={i}
                            style={[
                              styles.voiceBar,
                              {
                                height: 4 + Math.abs(Math.sin(i * 0.6)) * 14,
                                backgroundColor: mine
                                  ? "rgba(255,255,255,0.85)"
                                  : colors.text,
                              },
                            ]}
                          />
                        ))}
                      </View>
                      <Text
                        style={[
                          styles.bubbleText,
                          { color: mine ? "#fff" : colors.text },
                        ]}
                      >
                        {item.voiceSeconds}s
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={[
                        styles.bubbleText,
                        { color: mine ? "#fff" : colors.text },
                      ]}
                    >
                      {item.body}
                    </Text>
                  )}
                </View>
              </View>
            );
          }}
        />

        <View
          style={[
            styles.inputBar,
            {
              borderTopColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
        >
          <Pressable
            style={[styles.iconCircle, { borderColor: colors.border }]}
          >
            <Feather name="mic" size={18} color={colors.teal} />
          </Pressable>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="type · or hold mic to record"
            placeholderTextColor={colors.subtle}
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          />
          <Pressable
            onPress={send}
            style={[
              styles.sendBtn,
              {
                backgroundColor: draft.trim() ? colors.primary : colors.border,
              },
            ]}
          >
            <Feather name="arrow-up" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  projectBanner: {
    margin: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(94,234,212,0.06)",
  },
  projectText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 12 },
  bubbleWrap: { width: "100%" },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
  },
  bubbleText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20 },
  voiceBubble: { flexDirection: "row", alignItems: "center", gap: 8 },
  voiceWaveform: { flexDirection: "row", alignItems: "center", gap: 2 },
  voiceBar: { width: 2, borderRadius: 2 },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(245,240,255,0.04)",
  },
  input: {
    flex: 1,
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 21,
    borderWidth: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
