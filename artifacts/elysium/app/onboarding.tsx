import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  AccessibilityInfo,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StarField } from "@/components/StarField";
import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";
import { ALL_TAGS, ALL_DESTINATIONS, useOnboarding } from "@/context/OnboardingContext";

const STEPS = [
  { key: "welcome", title: "Welcome to Elysium" },
  { key: "profile", title: "Who are you?" },
  { key: "tags", title: "What resonates with you?" },
  { key: "destinations", title: "Where should your signal travel?" },
  { key: "friends", title: "Find your people" },
  { key: "done", title: "You're in" },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const onboarding = useOnboarding();
  const resonance = useResonance();

  if (!onboarding) return null;

  const {
    step,
    selfName,
    selfBio,
    selfCity,
    selectedTags,
    importedFriendIds,
    setStep,
    setSelfName,
    setSelfBio,
    setSelfCity,
    toggleTag,
    importFriend,
    removeImportedFriend,
    complete,
    skip,
  } = onboarding;

  const current = STEPS[step];
  const canNext = step === 0 || (step === 1 && selfName.trim().length > 0) || step >= 2;

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      AccessibilityInfo.announceForAccessibility(
        `Step ${step + 2} of ${STEPS.length}: ${STEPS[step + 1]?.title}`,
      );
    } else {
      complete();
      router.replace("/" as never);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const topPad = insets.top + 20;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]} accessible>
      <LinearGradient
        colors={[colors.background === "#F5F3FF" ? "#E4DEF0" : "#140928", colors.background]}
        style={StyleSheet.absoluteFill}
      />
      <StarField density={60} seed={7} />

      <View style={[styles.header, { paddingTop: topPad }]}>
        <View style={styles.progressRow}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                {
                  backgroundColor: i <= step ? colors.primary : colors.border,
                  flex: i === step ? 2 : 1,
                },
              ]}
              accessibilityLabel={`Step ${i + 1} ${i <= step ? "completed" : "upcoming"}`}
            />
          ))}
        </View>
        <Text style={[styles.stepLabel, { color: colors.mutedForeground }]}>
          STEP {step + 1} OF {STEPS.length}
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>{current?.title}</Text>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingBottom: 120, gap: 16, padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {step === 0 && <WelcomeStep colors={colors} />}
        {step === 1 && (
          <ProfileStep
            colors={colors}
            name={selfName}
            bio={selfBio}
            city={selfCity}
            setName={setSelfName}
            setBio={setSelfBio}
            setCity={setSelfCity}
          />
        )}
        {step === 2 && (
          <TagsStep
            colors={colors}
            selected={selectedTags}
            toggle={toggleTag}
          />
        )}
        {step === 3 && (
          <DestinationsStep
            colors={colors}
            resonance={resonance}
          />
        )}
        {step === 4 && (
          <FriendsStep
            colors={colors}
            resonance={resonance}
            importedIds={importedFriendIds}
            importFriend={importFriend}
            removeImported={removeImportedFriend}
          />
        )}
        {step === 5 && <DoneStep colors={colors} />}
      </ScrollView>

      {/* Bottom controls */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 16 }]}>
        {step > 0 ? (
          <Pressable
            onPress={handleBack}
            style={[styles.backBtn, { borderColor: colors.border }]}
            accessibilityLabel="Go back"
          >
            <Feather name="chevron-left" size={18} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
          </Pressable>
        ) : (
          <Pressable onPress={skip} accessibilityLabel="Skip onboarding">
            <Text style={[styles.skipText, { color: colors.mutedForeground }]}>Skip</Text>
          </Pressable>
        )}
        <Pressable
          onPress={handleNext}
          disabled={!canNext}
          style={[
            styles.nextBtn,
            { backgroundColor: canNext ? colors.primary : colors.border },
          ]}
          accessibilityLabel={step === STEPS.length - 1 ? "Enter Elysium" : "Continue"}
        >
          <Text style={styles.nextText}>
            {step === STEPS.length - 1 ? "Enter Elysium" : "Continue"}
          </Text>
          <Feather name="arrow-right" size={16} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

/* ── Step Components ─────────────────────────────────────────── */

function WelcomeStep({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.stepContent}>
      <View style={[styles.heroOrb, { backgroundColor: colors.primary + "22" }]}>
        <Text style={styles.heroGlyph}>✦</Text>
      </View>
      <Text style={[styles.heroTitle, { color: colors.text }]}>
        A softer internet
      </Text>
      <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
        Elysium is a social space built around resonance, not reach. Your
        signal travels to people who align with your energy — not the
        loudest room.
      </Text>
      <View style={styles.featureList}>
        {[
          { icon: "zap", text: "Resonance — not likes", color: colors.gold },
          { icon: "mic", text: "Voice-first conversations", color: colors.teal },
          { icon: "users", text: "Hubs — small rooms, real depth", color: colors.magenta },
          { icon: "navigation", text: "Destinations — where your signal goes", color: colors.emerald },
        ].map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: f.color + "22" }]}>
              <Feather name={f.icon as any} size={16} color={f.color} />
            </View>
            <Text style={[styles.featureText, { color: colors.text }]}>{f.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ProfileStep({
  colors,
  name,
  bio,
  city,
  setName,
  setBio,
  setCity,
}: {
  colors: ReturnType<typeof useColors>;
  name: string;
  bio: string;
  city: string;
  setName: (s: string) => void;
  setBio: (s: string) => void;
  setCity: (s: string) => void;
}) {
  return (
    <View style={styles.stepContent}>
      <View style={[styles.avatarPreview, { backgroundColor: colors.primary }]}>
        <Text style={styles.avatarPreviewText}>
          {name ? name.charAt(0).toUpperCase() : "?"}
        </Text>
      </View>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
        YOUR NAME *
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="What should people call you?"
        placeholderTextColor={colors.subtle}
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
        accessibilityLabel="Your name"
        autoCapitalize="words"
      />
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
        BIO
      </Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        placeholder="A short line about you"
        placeholderTextColor={colors.subtle}
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }, { minHeight: 60 }]}
        multiline
        accessibilityLabel="Your bio"
      />
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
        CITY
      </Text>
      <TextInput
        value={city}
        onChangeText={setCity}
        placeholder="Where are you based?"
        placeholderTextColor={colors.subtle}
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
        accessibilityLabel="Your city"
        autoCapitalize="words"
      />
    </View>
  );
}

function TagsStep({
  colors,
  selected,
  toggle,
}: {
  colors: ReturnType<typeof useColors>;
  selected: string[];
  toggle: (t: string) => void;
}) {
  return (
    <View style={styles.stepContent}>
      <Text style={[styles.stepHint, { color: colors.mutedForeground }]}>
        Pick at least 3 tags that describe you. These help the Resonance Engine
        find your people.
      </Text>
      <View style={styles.chipGrid}>
        {ALL_TAGS.map((tag) => {
          const active = selected.includes(tag);
          return (
            <Pressable
              key={tag}
              onPress={() => toggle(tag)}
              style={[
                styles.chip,
                {
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.primary + "22" : colors.card,
                },
              ]}
              accessibilityLabel={`${tag}${active ? " selected" : ""}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? colors.primary : colors.mutedForeground },
                ]}
              >
                {tag}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.countHint, { color: colors.subtle }]}>
        {selected.length} selected
      </Text>
    </View>
  );
}

function DestinationsStep({
  colors,
  resonance,
}: {
  colors: ReturnType<typeof useColors>;
  resonance: ReturnType<typeof useResonance>;
}) {
  return (
    <View style={styles.stepContent}>
      <Text style={[styles.stepHint, { color: colors.mutedForeground }]}>
        Destinations are channels where your signal travels. Follow any that
        resonate with you — your feed will surface content from these spaces.
      </Text>
      <View style={styles.chipGrid}>
        {ALL_DESTINATIONS.map((dest) => {
          const isFollowing = resonance.isFollowing(dest); // not a real user, but we use tags
          return (
            <Pressable
              key={dest}
              onPress={() => {
                // For now, follow/seed-user destinations via tag
                // This is handled through the tag system
              }}
              style={[
                styles.chip,
                {
                  borderColor: colors.gold + "55",
                  backgroundColor: colors.gold + "12",
                },
              ]}
              accessibilityLabel={`Destination ${dest}`}
            >
              <Feather name="navigation" size={10} color={colors.gold} />
              <Text style={[styles.chipText, { color: colors.gold }]}>
                {dest}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function FriendsStep({
  colors,
  resonance,
  importedIds,
  importFriend,
  removeImported,
}: {
  colors: ReturnType<typeof useColors>;
  resonance: ReturnType<typeof useResonance>;
  importedIds: string[];
  importFriend: (id: string) => void;
  removeImported: (id: string) => void;
}) {
  const otherUsers = resonance.users.filter((u) => u.id !== resonance.selfId);

  return (
    <View style={styles.stepContent}>
      <Text style={[styles.stepHint, { color: colors.mutedForeground }]}>
        Follow people whose energy aligns with yours. The Resonance Engine
        will suggest more as you explore.
      </Text>
      <View style={[styles.importBanner, { borderColor: colors.teal + "55", backgroundColor: colors.teal + "0C" }]}>
        <Feather name="users" size={14} color={colors.teal} />
        <Text style={[styles.importBannerText, { color: colors.teal }]}>
          Suggested based on your tags and destinations
        </Text>
      </View>
      {otherUsers.map((u) => {
        const imported = importedIds.includes(u.id);
        const alreadyFollowing = resonance.isFollowing(u.id);
        const isFriend = imported || alreadyFollowing;
        return (
          <View
            key={u.id}
            style={[
              styles.friendRow,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.friendAvatar, { backgroundColor: u.avatarColor }]}>
              <Text style={styles.friendAvatarText}>{u.avatarGlyph}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.friendName, { color: colors.text }]}>{u.name}</Text>
              <Text style={[styles.friendMeta, { color: colors.mutedForeground }]}>
                {u.city} · {u.tags.slice(0, 2).join(", ")}
              </Text>
            </View>
            <Pressable
              onPress={() => isFriend ? removeImported(u.id) : importFriend(u.id)}
              style={[
                styles.friendBtn,
                {
                  borderColor: isFriend ? colors.emerald : colors.primary,
                  backgroundColor: isFriend ? colors.emerald + "22" : colors.primary + "22",
                },
              ]}
              accessibilityLabel={isFriend ? `Unfollow ${u.name}` : `Follow ${u.name}`}
              accessibilityRole="button"
            >
              <Feather
                name={isFriend ? "check" : "user-plus"}
                size={14}
                color={isFriend ? colors.emerald : colors.primary}
              />
              <Text
                style={[
                  styles.friendBtnText,
                  { color: isFriend ? colors.emerald : colors.primary },
                ]}
              >
                {isFriend ? "Following" : "Follow"}
              </Text>
            </Pressable>
          </View>
        );
      })}
      <Text style={[styles.countHint, { color: colors.subtle }]}>
        {importedIds.length + (resonance.users.filter((u) => resonance.isFollowing(u.id)).length > importedIds.length ? 0 : 0)} connections
      </Text>
    </View>
  );
}

function DoneStep({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.stepContent}>
      <View style={[styles.heroOrb, { backgroundColor: colors.emerald + "22" }]}>
        <Feather name="check-circle" size={40} color={colors.emerald} />
      </View>
      <Text style={[styles.heroTitle, { color: colors.text }]}>
        You're ready
      </Text>
      <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
        Your signal is live. The Resonance Engine will quietly connect you
        with people and hubs whose energy aligns with yours. Welcome to
        the softer internet.
      </Text>
      <View style={[styles.doneCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
        {[
          { icon: "home", text: "Your feed is tuned to your resonance", color: colors.primary },
          { icon: "mic", text: "Voice rooms are waiting for you", color: colors.teal },
          { icon: "users", text: "Hubs match your interests", color: colors.magenta },
          { icon: "bell", text: "Notifications will surface what matters", color: colors.gold },
        ].map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Feather name={f.icon as any} size={16} color={f.color} />
            <Text style={[styles.featureText, { color: colors.text }]}>{f.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  progressRow: { flexDirection: "row", gap: 4, marginBottom: 16 },
  progressDot: { height: 3, borderRadius: 2 },
  stepLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  body: { flex: 1 },
  stepContent: { gap: 14, paddingBottom: 16 },
  heroOrb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  heroGlyph: { color: "#B57BFF", fontSize: 36 },
  heroTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  heroSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  featureList: { gap: 12, marginTop: 8 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: { fontFamily: "Inter_500Medium", fontSize: 14, flex: 1 },
  fieldLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.2,
    marginTop: 4,
  },
  input: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  stepHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  countHint: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  importBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  importBannerText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    flex: 1,
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  friendAvatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },
  friendName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  friendMeta: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  friendBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  friendBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  doneCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginTop: 8,
  },
  avatarPreview: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  avatarPreviewText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 28 },
  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: "rgba(7,2,26,0.92)",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  backText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  skipText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
  },
  nextText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14 },
});
