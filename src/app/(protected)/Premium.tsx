import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-react";
import { ms, s, vs } from "react-native-size-matters";
import { Ionicons } from "@expo/vector-icons";
import { getColorScheme } from "../../config/color";
import { useSupabase } from "../../config/supabase";
import { useQuery } from "@tanstack/react-query";
import { fetchPremiumStatus, setPremiumStatus } from "../../services/premiumService";
import { showMessage } from "react-native-flash-message";
import { router } from "expo-router";

export default function Premium() {
  const supabase = useSupabase();
  const { user } = useUser();
  const { backgroundColor, textColor, groupBoxColor } = getColorScheme();

  const [loading, setLoading] = useState(false);

  const { data: isPremium, isLoading } = useQuery({
    queryKey: ["premium", user?.id],
    enabled: !!user?.id,
    queryFn: () => fetchPremiumStatus(user!.id, supabase),
    staleTime: 30_000,
  });

  const testMode = useMemo(() => {
    // Optional: enable a simple test button via env var.
    return process.env.EXPO_PUBLIC_PREMIUM_TEST_MODE === "true";
  }, []);

  const onActivatePremium = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await setPremiumStatus(user.id, true, supabase);
      showMessage({
        message: "Premium enabled",
        description: "Your premium flag was updated in Supabase.",
        type: "success",
      });
    } catch (e: any) {
      showMessage({
        message: "Failed",
        description: e?.message ?? "Could not enable premium.",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={styles.container}>
       
        <View style={[styles.card, { backgroundColor: groupBoxColor }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityRole="button"
            >
              <Ionicons name="chevron-back" size={ms(20)} color={textColor} />
            </TouchableOpacity>
            <View style={[styles.iconWrap, { borderColor: "#FF5700" }]}>
              <Ionicons name="sparkles" size={ms(22)} color="#FF5700" />
            </View>
            <Text style={[styles.title, { color: textColor }]}>Premium</Text>
          </View>

          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <>
              <Text style={[styles.subtitle, { color: textColor }]}>
                Unlock the best LAPSocial experience.
              </Text>

              <View style={styles.featureList}>
                <View style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={ms(16)} color="#FF5700" />
                  <Text style={[styles.featureText, { color: textColor }]}>
                    Unlimited AI chat (Gemini)
                  </Text>
                </View>
                <View style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={ms(16)} color="#FF5700" />
                  <Text style={[styles.featureText, { color: textColor }]}>
                    Priority features coming soon
                  </Text>
                </View>
              </View>

              {isPremium ? (
                <View style={styles.alreadyPremium}>
                  <Ionicons name="sparkles" size={ms(18)} color="#FF5700" />
                  <Text style={[styles.alreadyPremiumText, { color: textColor }]}>
                    You are already Premium
                  </Text>
                </View>
              ) : (
                <>
                  {testMode ? (
                    <TouchableOpacity
                      style={styles.primaryButton}
                      onPress={onActivatePremium}
                      disabled={loading}
                    >
                      <Text style={styles.primaryButtonText}>
                        {loading ? "Enabling..." : "Activate Premium (Test)"}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.primaryButton}
                      onPress={() => {
                        showMessage({
                          message: "Coming soon",
                          description:
                            "Add RevenueCat/Stripe/IAP to actually sell Premium. For now, enable test mode with EXPO_PUBLIC_PREMIUM_TEST_MODE=true.",
                          type: "info",
                        });
                      }}
                      disabled={loading}
                    >
                      <Text style={styles.primaryButtonText}>Upgrade to Premium</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => showMessage({ message: "Tip", description: "Premium is currently gated by your Supabase users row.", type: "info" })}
                  >
                    <Text style={[styles.secondaryButtonText, { color: textColor }]}>
                      How premium works
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: s(16),
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    borderRadius: ms(20),
    padding: s(18),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(12),
    marginBottom: vs(12),
  },
  backButton: {
    height: vs(40),
    width: vs(40),
    borderRadius: ms(14),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(127,127,127,0.15)",
  },
  iconWrap: {
    height: vs(44),
    width: vs(44),
    borderRadius: ms(16),
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,87,0,0.08)",
  },
  title: {
    fontSize: ms(26),
    fontWeight: "900",
  },
  subtitle: {
    fontSize: ms(14),
    opacity: 0.9,
    marginBottom: vs(14),
    fontWeight: "600",
  },
  featureList: {
    gap: vs(12),
    marginBottom: vs(18),
  },
  featureRow: {
    flexDirection: "row",
    gap: s(10),
    alignItems: "center",
  },
  featureText: {
    fontSize: ms(15),
    fontWeight: "700",
  },
  alreadyPremium: {
    flexDirection: "row",
    gap: s(10),
    alignItems: "center",
    backgroundColor: "rgba(255,87,0,0.12)",
    borderRadius: ms(16),
    padding: s(12),
  },
  alreadyPremiumText: {
    fontSize: ms(16),
    fontWeight: "800",
  },
  primaryButton: {
    backgroundColor: "#FF5700",
    borderRadius: ms(16),
    paddingVertical: vs(14),
    alignItems: "center",
    marginBottom: vs(10),
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "900",
    fontSize: ms(16),
  },
  secondaryButton: {
    paddingVertical: vs(12),
    alignItems: "center",
  },
  secondaryButtonText: {
    fontWeight: "800",
    opacity: 0.9,
  },
});

