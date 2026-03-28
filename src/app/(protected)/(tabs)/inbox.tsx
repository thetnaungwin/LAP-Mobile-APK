import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { getColorScheme } from "../../../config/color";
import { useTabHeaderPadding } from "../../../hooks/useTabHeaderPadding";
import Constants from "expo-constants";
import { MaterialIcons } from "@expo/vector-icons";
import { ms, s, vs } from "react-native-size-matters";

const InboxScreen = () => {
  const topPadding = useTabHeaderPadding();
  const { backgroundColor, groupBoxColor, textColor } = getColorScheme();
  const appVersion = Constants.manifest.version || "1.0.0"; // fallback

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={[styles.aboutSection, { backgroundColor: groupBoxColor }]}
        contentContainerStyle={{
          paddingTop: topPadding,
          paddingBottom: vs(20),
        }}
      >
        <View style={styles.iconContainer}>
          <MaterialIcons name="info-outline" size={ms(40)} color={textColor} />
        </View>
        <Text style={[styles.aboutTitle, { color: textColor }]}>
          Inbox
        </Text>
        <Text style={[styles.aboutText, { color: textColor }]}>
          Stay up to date with replies, mentions, and important account updates.
        </Text>
        <Text style={[styles.aboutText, { color: textColor }]}>
          New this week
        </Text>
        <Text style={[styles.aboutText, { color: textColor }]}>
          • You joined `r/technology` successfully.{"\n"}• Alex replied to your
          post: "Great point, thanks for sharing."{"\n"}• Your post in
          `r/mobiledev` reached 120 upvotes.{"\n"}• Community guidelines were
          updated for `r/startups`.{"\n"}• Security notice: login from iPhone
          15 Pro, Yangon (2 hours ago).
        </Text>
        <Text style={[styles.aboutText, { color: textColor }]}>
          Premium updates
        </Text>
        <Text
          style={[styles.aboutText, { color: textColor, fontWeight: "600" }]}
        >
          • AI Chat is now Premium only.{"\n"}• Premium members get priority
          support and early feature access.
        </Text>
        <Text
          style={[styles.aboutText, { color: textColor, fontWeight: "600" }]}
        >
          Need help? Contact support at lapsocialmoderator@gmail.com
        </Text>

        <Text style={[styles.version, { color: textColor }]}>
          LAPSocial v{appVersion}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: s(15),
  },
  aboutSection: {
    flex: 1,
    borderRadius: ms(12),
    padding: s(15),
    elevation: 2,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: vs(10),
  },
  aboutTitle: {
    fontSize: ms(20),
    fontWeight: "bold",
    marginBottom: vs(8),
    textAlign: "center",
  },
  aboutText: {
    fontSize: ms(14),
    lineHeight: vs(20),
    marginBottom: vs(15),
    textAlign: "center",
  },
  version: {
    fontSize: ms(14),
    opacity: 0.7,
    textAlign: "center",
  },
});

export default InboxScreen;
