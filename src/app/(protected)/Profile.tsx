import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../config/color";
import { router } from "expo-router";

const mockPosts = [
  {
    id: "1",
    title: "My first post!",
    subreddit: "r/reactnative",
    upvotes: 123,
  },
  {
    id: "2",
    title: "Check out my app",
    subreddit: "r/programming",
    upvotes: 87,
  },
];

const Profile = () => {
  const [tab, setTab] = useState<"Posts" | "Comments" | "About">("Posts");

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Top Bar with Close */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={handleClose}>
          <Ionicons name="close" size={28} color="#878a8c" />
        </TouchableOpacity>
      </View>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: "https://www.redditstatic.com/avatars/avatar_default_02_24A0ED.png",
          }}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.username}>u/YourUsername</Text>
          <Text style={styles.karma}>1,234 karma</Text>
          <Text style={styles.cakeDay}>Cake day: Jan 1, 2020</Text>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {["Posts", "Comments", "About"].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t as any)}
            style={[styles.tab, tab === t && styles.activeTab]}
          >
            <Text style={tab === t ? styles.activeTabText : styles.tabText}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {tab === "Posts" && (
          <FlatList
            data={mockPosts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.post}>
                <Text style={styles.postTitle}>{item.title}</Text>
                <Text style={styles.postSubreddit}>{item.subreddit}</Text>
                <Text style={styles.postUpvotes}>{item.upvotes} upvotes</Text>
              </View>
            )}
          />
        )}
        {tab === "Comments" && (
          <Text style={styles.placeholder}>No comments yet.</Text>
        )}
        {tab === "About" && (
          <View>
            <Text style={styles.bio}>
              This is your Reddit bio. Edit it to tell people about yourself!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background, // #E8E8F0
    width: "80%",
    alignSelf: "flex-end",
    borderTopLeftRadius: 24, // Optional: rounded corner for modern look
    borderBottomLeftRadius: 24, // Optional: rounded corner for modern look
    shadowColor: "#000", // Optional: subtle shadow for depth
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4, // Android shadow
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: Colors.light.background, // #E8E8F0 for top bar
  },
  iconButton: {
    padding: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.light.background, // Changed to #E8E8F0 for header
  },
  avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 16 },
  headerInfo: { flex: 1 },
  username: { fontWeight: "bold", fontSize: 20 },
  karma: { color: "#878a8c", fontSize: 14 },
  cakeDay: { color: "#878a8c", fontSize: 14 },
  editButton: { backgroundColor: "#0079d3", padding: 8, borderRadius: 4 },
  editButtonText: { color: "#fff", fontWeight: "bold" },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: { flex: 1, alignItems: "center", padding: 12 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "#0079d3" },
  tabText: { color: "#878a8c" },
  activeTabText: { color: "#0079d3", fontWeight: "bold" },
  tabContent: { flex: 1, padding: 16 },
  post: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f6f7f8",
    borderRadius: 8,
  },
  postTitle: { fontWeight: "bold", fontSize: 16 },
  postSubreddit: { color: "#878a8c" },
  postUpvotes: { color: "#878a8c", fontSize: 12 },
  placeholder: { color: "#878a8c", textAlign: "center", marginTop: 32 },
  bio: { fontSize: 16, color: "#222" },
});

export default Profile;
