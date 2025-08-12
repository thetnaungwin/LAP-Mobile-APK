import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { getColorScheme } from "../../../config/color";
import Constants from "expo-constants";
import { MaterialIcons } from "@expo/vector-icons";
import { ms, s, vs } from "react-native-size-matters";

const InboxScreen = () => {
  const { backgroundColor, groupBoxColor, textColor } = getColorScheme();
  const appVersion = Constants.manifest.version || "1.0.0"; // fallback

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={[styles.aboutSection, { backgroundColor: groupBoxColor }]}
        contentContainerStyle={{ paddingBottom: vs(20) }}
      >
        <View style={styles.iconContainer}>
          <MaterialIcons name="info-outline" size={ms(40)} color={textColor} />
        </View>
        <Text style={[styles.aboutTitle, { color: textColor }]}>
          About This App
        </Text>
        <Text style={[styles.aboutText, { color: textColor }]}>
          This app is a Reddit clone built to replicate the core features of
          Reddit — communities, posts, comments, and real-time interactions.
        </Text>
        <Text style={[styles.version, { color: textColor }]}>
          App Version: {appVersion}
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
