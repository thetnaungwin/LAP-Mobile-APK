import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons, AntDesign, Feather } from "@expo/vector-icons";
import { getColorScheme } from "../../config/color";
import { router } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import ModalBox from "../../component/ModalBox";
import { ms, s, vs } from "react-native-size-matters";
import { useQuery } from "@tanstack/react-query";
import { fetchPostByUserId } from "../../services/postService";
import { useSupabase } from "../../config/supabase";

const { width } = Dimensions.get("window");

const Profile = () => {
  const [tab, setTab] = useState<"Posts" | "Comments" | "About">("Posts");
  const { backgroundColor, profileMdColor, textColor } = getColorScheme();
  const { signOut } = useAuth();
  const { user } = useUser();
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const dispatch = useDispatch();
  const supabase = useSupabase();

  const { data, isLoading } = useQuery({
    queryKey: ["posts", user?.id],
    // @ts-ignore
    queryFn: () => fetchPostByUserId(user.id, supabase),
  });

  const handleClose = () => {
    router.back();
  };

  const handleClosePress = () => {
    setShowDiscardModal(true);
  };

  const handleDiscard = async () => {
    setShowDiscardModal(false);
    await signOut();
    dispatch(logout());
  };

  const handleCancel = () => {
    setShowDiscardModal(false);
  };

  return (
    <SafeAreaView style={[{ ...styles.safeArea, backgroundColor }]}>
      {/* Logout Modal */}
      <ModalBox
        showDiscardModal={showDiscardModal}
        handleDiscard={handleDiscard}
        handleCancel={handleCancel}
        title="Log out now?"
        BodyText="You'll be signed out and returned to the login screen."
        btnActionText="Log Out"
        btnCancelText="Cancel"
      />
      <View
        style={[{ ...styles.profileCard, backgroundColor: profileMdColor }]}
      >
        {/* Banner */}
        <View style={styles.banner} />
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={ms(26)} color="#878a8c" />
        </TouchableOpacity>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri:
                user?.imageUrl ||
                "https://www.redditstatic.com/avatars/avatar_default_02_24A0ED.png",
            }}
            style={styles.avatar}
          />
        </View>
        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={[{ ...styles.username, color: textColor }]}>
            {user?.username ? `u/${user.username}` : "u/YourUsername"}
          </Text>
          <View style={styles.statsRow}>
            <Feather name="arrow-up" size={ms(15)} color="#878a8c" />
            <Text style={styles.karma}>1,234 karma</Text>
            <Feather
              name="gift"
              size={ms(15)}
              color="#878a8c"
              style={{ marginLeft: s(16) }}
            />
            <Text style={styles.cakeDay}>
              {user?.createdAt &&
                (() => {
                  const date = new Date(user.createdAt);
                  const day = date.getDate();
                  const month = date.getMonth() + 1;
                  const year = date.getFullYear();
                  return `${day}/${month}/${year}`;
                })()}
            </Text>
          </View>
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
          {tab === "Posts" &&
            (isLoading ? (
              <ActivityIndicator />
            ) : (
              <FlatList
                style={{
                  height: "50%",
                  overflow: "hidden",
                }}
                data={data}
                keyExtractor={(item) => item.post_id}
                renderItem={({ item }) => (
                  <View style={styles.postCard}>
                    <View style={styles.voteColumn}>
                      <AntDesign name="up" size={ms(16)} color="#878a8c" />
                      <Text style={styles.voteCount}>{item.upvote_count}</Text>
                      <AntDesign name="down" size={ms(16)} color="#878a8c" />
                    </View>
                    <View style={styles.postContent}>
                      <Text style={styles.postTitle}>{item.title}</Text>
                      <Text style={styles.postSubreddit}>
                        {item.group_name}
                      </Text>
                    </View>
                  </View>
                )}
              />
            ))}
          {tab === "Comments" && (
            <Text style={styles.placeholder}>No comments yet.</Text>
          )}
          {tab === "About" && (
            <View>
              <Text style={[{ ...styles.bio, color: textColor }]}>
                This is your Reddit bio. Edit it to tell people about yourself!
              </Text>
            </View>
          )}
        </View>
      </View>
      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleClosePress}>
        <AntDesign
          name="logout"
          size={ms(18)}
          color="#FF5700"
          style={{ marginRight: s(8) }}
        />
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCard: {
    width: width > 420 ? 420 : width * 0.95,
    height: "80%",
    borderRadius: s(18),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    alignItems: "center",
    marginTop: vs(32),
    marginBottom: vs(16),
    overflow: "visible",
  },
  banner: {
    width: "100%",
    height: vs(80),
    backgroundColor: "#0079d3",
    borderTopLeftRadius: s(18),
    borderTopRightRadius: s(18),
  },
  closeButton: {
    position: "absolute",
    top: vs(16),
    right: s(16),
    zIndex: 2,
    backgroundColor: "#fff",
    borderRadius: ms(16),
    padding: s(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    position: "absolute",
    top: vs(40),
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 3,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: s(48),
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#eee",
  },
  userInfo: {
    marginTop: vs(50),
    alignItems: "center",
    marginBottom: vs(12),
  },
  username: {
    fontWeight: "bold",
    fontSize: ms(22),
    marginBottom: vs(6),
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: vs(2),
  },
  karma: {
    color: "#878a8c",
    fontSize: ms(15),
    marginLeft: s(6),
  },
  cakeDay: {
    color: "#878a8c",
    fontSize: ms(15),
    marginLeft: s(6),
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
    marginTop: vs(8),
    backgroundColor: "#f6f7f8",
    borderRadius: ms(20),
    alignSelf: "center",
    marginBottom: vs(8),
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: vs(10),
    borderRadius: ms(20),
  },
  activeTab: {
    backgroundColor: "#fff",
    borderRadius: ms(20),
    shadowColor: "#0079d3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    color: "#878a8c",
    fontWeight: "500",
    fontSize: ms(15),
  },
  activeTabText: {
    color: "#0079d3",
    fontWeight: "bold",
    fontSize: ms(15),
  },
  tabContent: {
    width: "100%",
    minHeight: 180,
    padding: s(14),
    paddingTop: vs(8),
  },
  postCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f6f7f8",
    borderRadius: ms(12),
    marginBottom: vs(14),
    padding: s(8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  voteColumn: {
    alignItems: "center",
    marginRight: 12,
    width: 32,
  },
  voteCount: {
    fontWeight: "bold",
    color: "#222",
    fontSize: 15,
    marginVertical: 2,
  },
  postContent: {
    flex: 1,
  },
  postTitle: {
    fontWeight: "bold",
    fontSize: ms(16),
    marginBottom: 2,
    color: "#222",
  },
  postSubreddit: {
    color: "#878a8c",
    fontSize: ms(13),
  },
  placeholder: {
    color: "#878a8c",
    textAlign: "center",
    marginTop: 32,
    fontSize: 16,
  },
  bio: {
    fontSize: ms(16),
    textAlign: "center",
    marginTop: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#FF5700",
    paddingVertical: vs(10),
    paddingHorizontal: s(24),
    borderRadius: ms(24),
    alignSelf: "center",
    marginVertical: vs(6),
    marginBottom: vs(24),
    shadowColor: "#FF5700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  logoutButtonText: {
    color: "#FF5700",
    fontWeight: "bold",
    fontSize: ms(16),
  },
});

export default Profile;
