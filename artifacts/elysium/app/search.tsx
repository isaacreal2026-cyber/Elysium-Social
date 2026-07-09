import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { PostCard } from "@/components/PostCard";
import { ScreenShell } from "@/components/ScreenShell";
import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";

const FILTERS: {
  key: "top" | "people" | "tags" | "posts" | "hubs";
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
}[] = [
  { key: "top", label: "Top", icon: "star" },
  { key: "people", label: "People", icon: "users" },
  { key: "tags", label: "Tags", icon: "hash" },
  { key: "posts", label: "Posts", icon: "feather" },
  { key: "hubs", label: "Hubs", icon: "hexagon" },
];

export default function SearchScreen() {
  const colors = useColors();
  const { users, posts, hubs, trending, selfId, isFollowing, toggleFollow } =
    useResonance();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("top");

  const query = q.trim().toLowerCase();

  const matchedPeople = useMemo(
    () =>
      users.filter(
        (u) =>
          u.id !== selfId &&
          (!query ||
            u.name.toLowerCase().includes(query) ||
            u.handle.toLowerCase().includes(query) ||
            u.tags.some((t) => t.toLowerCase().includes(query)) ||
            u.city.toLowerCase().includes(query)),
      ),
    [users, query, selfId],
  );

  const matchedTags = useMemo(
    () => trending.filter((t) => !query || t.tag.toLowerCase().includes(query)),
    [trending, query],
  );

  const matchedPosts = useMemo(
    () =>
      posts.filter(
        (p) =>
          !query ||
          p.body.toLowerCase().includes(query) ||
          p.destinations?.some((d) => d.toLowerCase().includes(query)),
      ),
    [posts, query],
  );

  const matchedHubs = useMemo(
    () =>
      hubs.filter(
        (h) =>
          !query ||
          h.name.toLowerCase().includes(query) ||
          h.tagline.toLowerCase().includes(query),
      ),
    [hubs, query],
  );

  const showSection = (key: string) => filter === "top" || filter === key;

  return (
    <ScreenShell title="Search" subtitle="people · tags · hubs · posts">
      <View
        style={[
          styles.searchBar,
          { borderColor: colors.border, backgroundColor: colors.card },
        ]}
      >
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="search the cosmos…"
          placeholderTextColor={colors.subtle}
          style={[styles.input, { color: colors.text }]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {q.length > 0 ? (
          <Pressable onPress={() => setQ("")}>
            <Feather name="x-circle" size={16} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={FILTERS}
        keyExtractor={(f) => f.key}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => {
          const active = filter === item.key;
          return (
            <Pressable
              onPress={() => setFilter(item.key)}
              style={[
                styles.filter,
                {
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active
                    ? colors.primary + "22"
                    : "rgba(245,240,255,0.04)",
                },
              ]}
            >
              <Feather
                name={item.icon}
                size={12}
                color={active ? colors.primary : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.filterText,
                  { color: active ? colors.primary : colors.mutedForeground },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
      >
        {showSection("tags") && matchedTags.length > 0 ? (
          <Section
            title={query ? "Matching tags" : "Trending now"}
            icon="trending-up"
          >
            <View style={styles.tagsGrid}>
              {matchedTags.map((t) => (
                <Pressable
                  key={t.tag}
                  onPress={() => router.push(`/tag/${t.tag}` as never)}
                  style={[
                    styles.tagCard,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                    },
                  ]}
                >
                  <Text style={[styles.tagName, { color: colors.gold }]}>
                    #{t.tag}
                  </Text>
                  <Text
                    style={[styles.tagMeta, { color: colors.mutedForeground }]}
                  >
                    {t.posts.toLocaleString()} posts · ↑
                    {Math.round(t.delta * 100)}%
                  </Text>
                </Pressable>
              ))}
            </View>
          </Section>
        ) : null}

        {showSection("people") && matchedPeople.length > 0 ? (
          <Section title={query ? "People" : "Suggested for you"} icon="users">
            {matchedPeople
              .slice(0, filter === "people" ? matchedPeople.length : 4)
              .map((u) => {
                const following = isFollowing(u.id);
                return (
                  <Pressable
                    key={u.id}
                    onPress={() => router.push(`/profile/${u.id}` as never)}
                    style={[
                      styles.peopleRow,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.card,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.pAvatar,
                        { backgroundColor: u.avatarColor },
                      ]}
                    >
                      <Text style={styles.pAvatarText}>{u.avatarGlyph}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pName, { color: colors.text }]}>
                        {u.name}
                      </Text>
                      <Text
                        style={[
                          styles.pHandle,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        {u.handle} · {u.city}
                      </Text>
                      <Text
                        style={[styles.pBio, { color: colors.subtle }]}
                        numberOfLines={1}
                      >
                        {u.bio}
                      </Text>
                    </View>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation?.();
                        toggleFollow(u.id);
                      }}
                      style={[
                        styles.followBtn,
                        {
                          backgroundColor: following
                            ? "transparent"
                            : colors.primary,
                          borderColor: following
                            ? colors.border
                            : colors.primary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.followText,
                          { color: following ? colors.text : "#fff" },
                        ]}
                      >
                        {following ? "Following" : "Follow"}
                      </Text>
                    </Pressable>
                  </Pressable>
                );
              })}
          </Section>
        ) : null}

        {showSection("hubs") && matchedHubs.length > 0 ? (
          <Section title="Hubs" icon="hexagon">
            {matchedHubs
              .slice(0, filter === "hubs" ? matchedHubs.length : 3)
              .map((h) => (
                <Pressable
                  key={h.id}
                  onPress={() => router.push(`/hub/${h.id}` as never)}
                  style={[
                    styles.hubRow,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.hubGlyph,
                      { backgroundColor: colors.primary + "22" },
                    ]}
                  >
                    <Feather name="hexagon" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.hubName, { color: colors.text }]}>
                      {h.name}
                    </Text>
                    <Text
                      style={[styles.hubTag, { color: colors.mutedForeground }]}
                      numberOfLines={1}
                    >
                      {h.tagline}
                    </Text>
                    <Text style={[styles.hubMeta, { color: colors.teal }]}>
                      {(h.members / 1000).toFixed(1)}k · {h.online.length}{" "}
                      orbiting
                    </Text>
                  </View>
                </Pressable>
              ))}
          </Section>
        ) : null}

        {showSection("posts") && matchedPosts.length > 0 && query ? (
          <Section title="Posts" icon="feather">
            {matchedPosts
              .slice(0, filter === "posts" ? matchedPosts.length : 3)
              .map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
          </Section>
        ) : null}

        {query &&
        !matchedPeople.length &&
        !matchedTags.length &&
        !matchedHubs.length &&
        !matchedPosts.length ? (
          <View style={styles.empty}>
            <Feather name="search" size={28} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              no echoes for "{q}"
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </ScreenShell>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 18 }}>
      <View style={styles.sectionHead}>
        <Feather name={icon} size={12} color="#A89AC8" />
        <Text style={styles.sectionLabel}>{title.toUpperCase()}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
  },
  input: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 14 },
  filterRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  filter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.3,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionLabel: {
    color: "#A89AC8",
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.2,
  },
  tagsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 130,
  },
  tagName: { fontFamily: "Inter_700Bold", fontSize: 14 },
  tagMeta: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 4 },
  peopleRow: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  pAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  pAvatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 17 },
  pName: { fontFamily: "Inter_700Bold", fontSize: 14 },
  pHandle: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 1 },
  pBio: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 4 },
  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  followText: { fontFamily: "Inter_700Bold", fontSize: 12 },
  hubRow: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  hubGlyph: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  hubName: { fontFamily: "Inter_700Bold", fontSize: 14 },
  hubTag: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 1 },
  hubMeta: { fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 4 },
  empty: { paddingTop: 60, alignItems: "center", gap: 10 },
  emptyText: { fontFamily: "Inter_500Medium", fontSize: 14 },
});
