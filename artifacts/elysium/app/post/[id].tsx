import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { Platform } from "react-native";

import { PostCard } from "@/components/PostCard";
import { ScreenShell } from "@/components/ScreenShell";
import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";
import type { Comment } from "@/lib/types";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { posts, comments, userById, addComment } = useResonance();
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [laughMode, setLaughMode] = useState(false);

  const post = posts.find((p) => p.id === id);
  const tree = useMemo(() => {
    const rel = comments.filter((c) => c.postId === id);
    const mainComments = rel.filter((c) => !c.laughThread && c.parentId === null);
    const laughComments = rel.filter((c) => c.laughThread && c.parentId === null);
    return { rel, mainComments, laughComments };
  }, [comments, id]);

  if (!post) {
    return (
      <ScreenShell title="Lost orbit" subtitle="this post drifted away">
        <Text style={{ color: colors.mutedForeground, padding: 24 }}>The post you're looking for is no longer here.</Text>
      </ScreenShell>
    );
  }

  const send = () => {
    if (!draft.trim()) return;
    addComment({ postId: id, parentId: replyTo, body: draft.trim(), laughThread: laughMode });
    setDraft("");
    setReplyTo(null);
  };

  return (
    <ScreenShell title="Resonance" subtitle="fractal threads · go as deep as you like">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0}>
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
          keyboardShouldPersistTaps="handled"
        >
          <PostCard post={post} />

          <View style={styles.threadHeader}>
            <Feather name="message-circle" size={14} color={colors.mutedForeground} />
            <Text style={[styles.threadHeaderText, { color: colors.mutedForeground }]}>
              {tree.rel.length} resonance threads
            </Text>
          </View>

          {tree.mainComments.map((c) => (
            <CommentNode
              key={c.id}
              comment={c}
              all={tree.rel}
              depth={0}
              onReply={(cid) => setReplyTo(cid)}
              activeReply={replyTo}
            />
          ))}

          {tree.laughComments.length > 0 ? (
            <View style={[styles.laughBox, { borderColor: colors.gold + "55", backgroundColor: colors.gold + "0F" }]}>
              <View style={styles.laughHeader}>
                <Feather name="zap" size={14} color={colors.gold} />
                <Text style={[styles.laughHeaderText, { color: colors.gold }]}>LAUGHING THREAD</Text>
                <Text style={[styles.laughMeta, { color: colors.mutedForeground }]}>going viral on its own</Text>
              </View>
              {tree.laughComments.map((c) => (
                <CommentNode
                  key={c.id}
                  comment={c}
                  all={tree.rel}
                  depth={0}
                  onReply={(cid) => { setReplyTo(cid); setLaughMode(true); }}
                  activeReply={replyTo}
                  laugh
                />
              ))}
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.inputBar, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <Pressable
            onPress={() => setLaughMode((v) => !v)}
            style={[
              styles.laughToggle,
              {
                borderColor: laughMode ? colors.gold : colors.border,
                backgroundColor: laughMode ? colors.gold + "22" : "transparent",
              },
            ]}
          >
            <Feather name="zap" size={16} color={laughMode ? colors.gold : colors.mutedForeground} />
          </Pressable>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={replyTo ? "reply to thread…" : laughMode ? "drop a one-liner…" : "add to the resonance…"}
            placeholderTextColor={colors.subtle}
            style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
          />
          <Pressable onPress={send} style={[styles.sendBtn, { backgroundColor: draft.trim() ? colors.primary : colors.border }]}>
            <Feather name="arrow-up" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

function CommentNode({
  comment,
  all,
  depth,
  onReply,
  activeReply,
  laugh,
}: {
  comment: Comment;
  all: Comment[];
  depth: number;
  onReply: (id: string) => void;
  activeReply: string | null;
  laugh?: boolean;
}) {
  const colors = useColors();
  const { userById } = useResonance();
  const author = userById(comment.authorId);
  const children = all.filter((c) => c.parentId === comment.id);

  return (
    <View style={{ marginLeft: depth === 0 ? 0 : 14, marginTop: 10 }}>
      <View style={[styles.comment, { borderColor: laugh ? colors.gold + "33" : colors.border, backgroundColor: laugh ? "transparent" : colors.card }]}>
        <View style={styles.commentHeader}>
          <View style={[styles.cAvatar, { backgroundColor: author?.avatarColor }]}>
            <Text style={styles.cAvatarText}>{author?.avatarGlyph}</Text>
          </View>
          <Text style={[styles.cName, { color: colors.text }]}>{author?.name}</Text>
          {comment.voiceSeconds ? (
            <View style={[styles.voiceTag, { borderColor: colors.teal }]}>
              <Feather name="mic" size={10} color={colors.teal} />
              <Text style={[styles.voiceTagText, { color: colors.teal }]}>{comment.voiceSeconds}s</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.cBody, { color: colors.text }]}>{comment.body}</Text>
        <View style={styles.cFooter}>
          <Pressable onPress={() => onReply(comment.id)} style={styles.cFooterBtn}>
            <Feather name="corner-down-right" size={12} color={activeReply === comment.id ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.cFooterText, { color: activeReply === comment.id ? colors.primary : colors.mutedForeground }]}>
              reply
            </Text>
          </Pressable>
          <View style={styles.cFooterBtn}>
            <Feather name="zap" size={12} color={colors.gold} />
            <Text style={[styles.cFooterText, { color: colors.mutedForeground }]}>{comment.resonance}</Text>
          </View>
        </View>
      </View>
      {children.length > 0 ? (
        <View style={{ borderLeftWidth: 1, borderLeftColor: colors.border + "55", paddingLeft: 6, marginTop: 4 }}>
          {children.map((c) => (
            <CommentNode key={c.id} comment={c} all={all} depth={depth + 1} onReply={onReply} activeReply={activeReply} laugh={laugh} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  threadHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    marginBottom: 8,
  },
  threadHeaderText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  comment: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  commentHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  cAvatar: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cAvatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 11 },
  cName: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  voiceTag: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, borderWidth: 1 },
  voiceTagText: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
  cBody: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20 },
  cFooter: { flexDirection: "row", gap: 14, marginTop: 8 },
  cFooterBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  cFooterText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  laughBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  laughHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  laughHeaderText: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1 },
  laughMeta: { fontFamily: "Inter_400Regular", fontSize: 10 },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
  },
  laughToggle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
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
