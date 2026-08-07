import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/useColors";
import type { Post, ElysiumUser } from "@/lib/types";

interface ShareSheetProps {
  visible: boolean;
  onClose: () => void;
  post: Post;
  author?: ElysiumUser;
}

const THEMES: [string, string][] = [
  ["#160B30", "#07021A"],
  ["#2D124D", "#0E0524"],
  ["#0B2B28", "#07021A"],
  ["#381E10", "#07021A"],
];

export function ShareSheet({
  visible,
  onClose,
  post,
  author,
}: ShareSheetProps) {
  const colors = useColors();
  const [themeIdx, setThemeIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (Platform.OS !== "web") {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Share to Cosmos</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          {/* Styled Card Preview */}
          <View style={[styles.cardPreviewWrap, { borderColor: colors.border }]}>
            <LinearGradient
              colors={THEMES[themeIdx]!}
              style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
            />
            <View style={styles.cardHeader}>
              <View style={[styles.avatar, { backgroundColor: author?.avatarColor ?? colors.primary }]}>
                <Text style={styles.avatarGlyph}>{author?.avatarGlyph ?? "?"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.authorName, { color: "#fff" }]}>{author?.name ?? "Elysium Member"}</Text>
                <Text style={[styles.authorHandle, { color: "rgba(245,240,255,0.7)" }]}>{author?.handle} · {author?.city}</Text>
              </View>
              <View style={[styles.badge, { borderColor: colors.gold + "55", backgroundColor: colors.gold + "15" }]}>
                <Text style={[styles.badgeText, { color: colors.gold }]}>✦ COSMIC SIGNAL</Text>
              </View>
            </View>

            <Text style={[styles.postBody, { color: "#fff" }]} numberOfLines={4}>
              {post.body}
            </Text>

            {post.destinations && post.destinations.length > 0 ? (
              <View style={styles.tagRow}>
                {post.destinations.map((d) => (
                  <Text key={d} style={[styles.tag, { color: colors.gold }]}>
                    #{d}
                  </Text>
                ))}
              </View>
            ) : null}

            <View style={styles.cardFooter}>
              <Text style={styles.brandMark}>ELYSIUM SOCIAL · RESONANCE SCORE {Math.round(post.energy * 100)}%</Text>
            </View>
          </View>

          {/* Theme Switcher */}
          <View style={styles.themeRow}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CARD GRADIENT</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {THEMES.map((theme, i) => (
                <Pressable
                  key={i}
                  onPress={() => setThemeIdx(i)}
                  style={[
                    styles.themeDot,
                    {
                      borderColor: themeIdx === i ? colors.primary : colors.border,
                      borderWidth: themeIdx === i ? 2 : 1,
                    },
                  ]}
                >
                  <LinearGradient colors={theme} style={StyleSheet.absoluteFill} />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <Pressable
              onPress={handleCopy}
              style={[styles.mainBtn, { backgroundColor: copied ? colors.emerald : colors.primary }]}
            >
              <Feather name={copied ? "check" : "copy"} size={16} color="#fff" />
              <Text style={styles.mainBtnText}>
                {copied ? "Cosmic Link Copied!" : "Copy Shareable Link"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(245,240,255,0.2)",
    alignSelf: "center",
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(245,240,255,0.06)",
  },
  cardPreviewWrap: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 160,
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarGlyph: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  authorName: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  authorHandle: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    letterSpacing: 0.8,
  },
  postBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 22,
    marginVertical: 12,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  brandMark: {
    color: "rgba(245,240,255,0.5)",
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    letterSpacing: 1.1,
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.1,
  },
  themeDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
  },
  actionRow: {
    marginTop: 4,
  },
  mainBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  mainBtnText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
});
