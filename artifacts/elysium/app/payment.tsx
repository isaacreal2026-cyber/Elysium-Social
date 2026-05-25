import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ScreenShell } from "@/components/ScreenShell";
import { useColors } from "@/hooks/useColors";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

const TIERS = [
  { label: "Spark", amount: 299, desc: "Boost your resonance for 7 days", icon: "zap" as const, color: "#FFD56B" },
  { label: "Flame", amount: 799, desc: "Cosmic Pro — 1 month of full power", icon: "star" as const, color: "#F472B6" },
  { label: "Supernova", amount: 1999, desc: "Lifetime orbital prestige badge", icon: "award" as const, color: "#B57BFF" },
];

type Status = "idle" | "loading" | "success" | "error";

export default function PaymentScreen() {
  const colors = useColors();
  const [selected, setSelected] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const tier = TIERS[selected]!;

  async function handlePurchase() {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`${BASE_URL}/api/payments/create-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: tier.amount,
          currency: "usd",
          description: `ELYSIUM ${tier.label}`,
        }),
      });
      const data = await res.json() as { clientSecret?: string; error?: string };
      if (!res.ok || data.error) {
        setErrorMsg(data.error ?? "Payment failed");
        setStatus("error");
        return;
      }
      setClientSecret(data.clientSecret ?? null);
      setStatus("success");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <ScreenShell title="Payment" showTabBar={false}>
        <View style={styles.successContainer}>
          <LinearGradient
            colors={["#B57BFF22", "#07021A"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.successIcon, { borderColor: "#B57BFF55", backgroundColor: "#B57BFF22" }]}>
            <Feather name="check-circle" size={48} color="#B57BFF" />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Payment initiated!</Text>
          <Text style={[styles.successSubtitle, { color: colors.mutedForeground }]}>
            Your {tier.label} upgrade is being processed. You'll receive a confirmation shortly.
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={[styles.doneBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.doneBtnText, { color: colors.primaryForeground }]}>Back to ELYSIUM</Text>
          </Pressable>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell title="Upgrade" subtitle="unlock your cosmic potential" showTabBar={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionLabel, { color: colors.subtle }]}>Choose your tier</Text>

        {TIERS.map((t, i) => {
          const active = i === selected;
          return (
            <Pressable
              key={t.label}
              onPress={() => { setSelected(i); setStatus("idle"); }}
              style={[
                styles.tierCard,
                {
                  borderColor: active ? t.color + "99" : colors.border,
                  backgroundColor: active ? t.color + "11" : colors.card,
                },
              ]}
            >
              <View style={[styles.tierIcon, { backgroundColor: t.color + "22" }]}>
                <Feather name={t.icon} size={22} color={t.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tierLabel, { color: colors.text }]}>{t.label}</Text>
                <Text style={[styles.tierDesc, { color: colors.mutedForeground }]}>{t.desc}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.tierPrice, { color: t.color }]}>
                  ${(t.amount / 100).toFixed(2)}
                </Text>
                {active && (
                  <View style={[styles.selectedDot, { backgroundColor: t.color }]} />
                )}
              </View>
            </Pressable>
          );
        })}

        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Plan</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{tier.label}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Total</Text>
            <Text style={[styles.summaryValue, { color: colors.accent }]}>
              ${(tier.amount / 100).toFixed(2)} USD
            </Text>
          </View>
        </View>

        {status === "error" && (
          <View style={[styles.errorBar, { backgroundColor: colors.destructive + "22", borderColor: colors.destructive + "55" }]}>
            <Feather name="alert-circle" size={13} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>{errorMsg}</Text>
          </View>
        )}

        <Pressable
          onPress={handlePurchase}
          disabled={status === "loading"}
          style={({ pressed }) => [
            styles.purchaseBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          {status === "loading" ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="zap" size={16} color="#fff" />
              <Text style={styles.purchaseBtnText}>Upgrade to {tier.label}</Text>
            </>
          )}
        </Pressable>

        <Text style={[styles.disclaimer, { color: colors.subtle }]}>
          Payments are processed securely via Stripe. Connect Stripe credentials in Secrets to activate.
        </Text>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },
  sectionLabel: { fontFamily: "Inter_500Medium", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 },
  tierCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  tierIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  tierLabel: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
  tierDesc: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  tierPrice: { fontFamily: "Inter_700Bold", fontSize: 18 },
  selectedDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4, alignSelf: "center" },
  summaryCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginTop: 8, marginBottom: 12, gap: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontFamily: "Inter_400Regular", fontSize: 14 },
  summaryValue: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  errorBar: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, marginBottom: 12,
  },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 13 },
  purchaseBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 16, borderRadius: 20, marginBottom: 14,
  },
  purchaseBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#fff" },
  disclaimer: { fontFamily: "Inter_400Regular", fontSize: 12, textAlign: "center", lineHeight: 18 },
  successContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  successIcon: { width: 90, height: 90, borderRadius: 45, borderWidth: 1, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  successTitle: { fontFamily: "Inter_700Bold", fontSize: 26, marginBottom: 10, textAlign: "center" },
  successSubtitle: { fontFamily: "Inter_400Regular", fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 32 },
  doneBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 20 },
  doneBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
});
