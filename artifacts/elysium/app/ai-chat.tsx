import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenShell } from "@/components/ScreenShell";
import { useColors } from "@/hooks/useColors";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: number;
  title: string;
}

export default function AiChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const streamingIdRef = useRef<string | null>(null);

  useEffect(() => {
    initConversation();
  }, []);

  async function initConversation() {
    try {
      const res = await fetch(`${BASE_URL}/api/openai/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "ELYSIUM AI Session" }),
      });
      const data = await res.json() as Conversation;
      setConversation(data);
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Welcome to ELYSIUM AI ✦ I'm your cosmic guide — ask me anything, explore ideas, or let me help you navigate your social universe.",
        },
      ]);
    } catch {
      setError("Could not connect to AI. Please try again.");
    }
  }

  const sendMessage = useCallback(async () => {
    if (!input.trim() || streaming || !conversation) return;
    const userText = input.trim();
    setInput("");
    setError(null);

    const userId = `u_${Date.now()}`;
    const assistantId = `a_${Date.now()}`;
    streamingIdRef.current = assistantId;

    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", content: userText },
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setStreaming(true);

    try {
      const res = await fetch(
        `${BASE_URL}/api/openai/conversations/${conversation.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: userText }),
        }
      );

      if (!res.body) throw new Error("No stream body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const json = JSON.parse(line.slice(6)) as { content?: string; done?: boolean };
            if (json.done) break;
            if (json.content) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + json.content }
                    : m
                )
              );
            }
          } catch {
            // skip malformed
          }
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setStreaming(false);
      streamingIdRef.current = null;
    }
  }, [input, streaming, conversation]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  function renderMessage({ item }: { item: Message }) {
    const isUser = item.role === "user";
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAI]}>
        {!isUser && (
          <View style={[styles.aiAvatar, { backgroundColor: colors.primaryDeep + "88", borderColor: colors.primary + "55" }]}>
            <Text style={styles.aiAvatarText}>✦</Text>
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser
              ? [styles.bubbleUser, { backgroundColor: colors.primaryDeep }]
              : [styles.bubbleAI, { backgroundColor: colors.card, borderColor: colors.border }],
          ]}
        >
          {item.content === "" && item.role === "assistant" ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.bubbleText, { color: isUser ? "#fff" : colors.text }]}>
              {item.content}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <ScreenShell title="AI Assistant" subtitle="powered by ELYSIUM intelligence" showTabBar={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderMessage}
          contentContainerStyle={[styles.list, { paddingBottom: 16 }]}
          showsVerticalScrollIndicator={false}
        />

        {error && (
          <View style={[styles.errorBar, { backgroundColor: colors.destructive + "22", borderColor: colors.destructive + "55" }]}>
            <Feather name="alert-circle" size={13} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        )}

        <View style={[styles.inputBar, { borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 8) }]}>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything…"
            placeholderTextColor={colors.subtle}
            multiline
            maxLength={2000}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <Pressable
            onPress={sendMessage}
            disabled={!input.trim() || streaming || !conversation}
            style={({ pressed }) => [
              styles.sendBtn,
              {
                backgroundColor:
                  !input.trim() || streaming || !conversation
                    ? colors.border
                    : colors.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            {streaming ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="send" size={16} color="#fff" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingTop: 8 },
  msgRow: { flexDirection: "row", marginVertical: 6, alignItems: "flex-end", gap: 8 },
  msgRowUser: { justifyContent: "flex-end" },
  msgRowAI: { justifyContent: "flex-start" },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  aiAvatarText: { fontSize: 13, color: "#B57BFF" },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleUser: { borderBottomRightRadius: 4 },
  bubbleAI: { borderWidth: 1, borderBottomLeftRadius: 4, minWidth: 40, minHeight: 36, alignItems: "center", justifyContent: "center" },
  bubbleText: { fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22 },
  errorBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 13 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
