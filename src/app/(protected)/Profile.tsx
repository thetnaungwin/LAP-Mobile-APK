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
  Modal,
  TextInput,
} from "react-native";
import { Ionicons, AntDesign, Feather } from "@expo/vector-icons";
import { getColorScheme } from "../../config/color";
import { router } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import ModalBox from "../../component/ModalBox";
import { ms, s, vs } from "react-native-size-matters";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchPostByUserId } from "../../services/postService";
import { useSupabase } from "../../config/supabase";
import { fetchGroups } from "../../services/groupService";
import { useQueryClient } from "@tanstack/react-query";
import { deleteUserProfile, fetchUserProfile, leaveGroup, updateUserProfile } from "../../services/userService";
import { fetchPremiumStatus } from "../../services/premiumService";
import { showMessage } from "react-native-flash-message";

const { width } = Dimensions.get("window");

const Profile = () => {
  const [tab, setTab] = useState<"Posts" | "Communities" | "About">("Posts");
  const { backgroundColor, profileMdColor, textColor, modalBg } = getColorScheme();
  const { signOut } = useAuth();
  const { user } = useUser();
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const dispatch = useDispatch();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const [leavingGroupId, setLeavingGroupId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["posts", user?.id],
    // @ts-ignore
    queryFn: () => fetchPostByUserId(user.id, supabase),
  });

  const {
    data: groups,
    isLoading: loadGroups,
    error,
  } = useQuery({
    queryKey: ["groups", user?.id],
    // @ts-ignore
    queryFn: () => fetchGroups(user?.id, searchValue, supabase),
    staleTime: 10_000,
    placeholderData: (previousData) => previousData,
  });

  const { data: isPremium, isLoading: premiumLoading } = useQuery({
    queryKey: ["premium", user?.id],
    enabled: !!user?.id,
    // @ts-ignore
    queryFn: () => fetchPremiumStatus(user!.id, supabase),
    staleTime: 30_000,
  });

  const {
    data: userProfile,
    isLoading: loadingUserProfile,
  } = useQuery({
    queryKey: ["userProfile", user?.id],
    enabled: !!user?.id,
    // @ts-ignore
    queryFn: () => fetchUserProfile(user!.id, supabase),
    staleTime: 30_000,
  });

  const displayUsername =
    userProfile?.user_name ?? user?.username ?? "YourUsername";

  const { mutate: leaveGroupMutation } = useMutation({
    // @ts-ignore
    mutationFn: (groupId: string) => leaveGroup(user?.id, groupId, supabase),
    onMutate: (groupId) => {
      setLeavingGroupId(groupId);
    },
    onSettled: () => {
      setLeavingGroupId(null);
    },
    onSuccess: (_data, groupId) => {
      queryClient.setQueryData(["groups", user?.id], (old: any) =>
        old ? old.filter((g: any) => g.id !== groupId) : []
      );
    },
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

  const handleSaveAccount = async () => {
    if (!user?.id) return;
    const nextUsername = editUsername.trim();
    if (!nextUsername) {
      showMessage({
        message: "Username required",
        description: "Please enter a username.",
        type: "warning",
      });
      return;
    }

    setSavingAccount(true);
    try {
      await updateUserProfile(
        user.id,
        { user_name: nextUsername },
        supabase
      );

      // Keep Clerk in sync (best-effort).
      // Clerk username update support depends on the SDK/provider being used.
      const maybeUpdate = (user as any)?.update;
      if (typeof maybeUpdate === "function") {
        await maybeUpdate.call(user, { username: nextUsername });
      }
      setShowEditAccountModal(false);

      await queryClient.invalidateQueries({
        queryKey: ["userProfile", user.id],
      });

      showMessage({
        message: "Account updated",
        description: "Your username was saved.",
        type: "success",
      });
    } catch (e: any) {
      showMessage({
        message: "Update failed",
        description: e?.message ?? "Could not update account.",
        type: "danger",
      });
    } finally {
      setSavingAccount(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    setDeletingAccount(true);
    setShowDeleteAccountModal(false);

    try {
      await deleteUserProfile(user.id, supabase);
      // Also delete the Clerk account for this user (self-delete).
      // This avoids needing a server-side Clerk secret key.
      const maybeDelete = (user as any)?.delete;
      if (typeof maybeDelete === "function") {
        await maybeDelete.call(user);
      } else {
        throw new Error("Clerk user deletion is unavailable in this client.");
      }
      showMessage({
        message: "Account deleted",
        description: "Your LAPSocial profile data and Clerk account were deleted.",
        type: "success",
      });
    } catch (e: any) {
      showMessage({
        message: "Delete failed",
        description:
          e?.message ??
          "We couldn’t delete your account right now. Please try again.",
        type: "danger",
      });
    } finally {
      try {
        await signOut();
      } finally {
        dispatch(logout());
        setDeletingAccount(false);
      }
    }
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

      {/* Delete Account Modal */}
      <ModalBox
        showDiscardModal={showDeleteAccountModal}
        handleDiscard={handleDeleteAccount}
        handleCancel={() => setShowDeleteAccountModal(false)}
        title="Delete account?"
        BodyText="This will end your session and remove your LAPSocial profile data."
        btnActionText={deletingAccount ? "Deleting..." : "Delete"}
        btnCancelText="Cancel"
      />

      {/* Edit Account Modal */}
      <Modal
        visible={showEditAccountModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditAccountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.editModalContent, { backgroundColor: modalBg }]}>
            <Text style={[styles.editModalTitle, { color: textColor }]}>
              Edit account
            </Text>
            <Text style={[styles.editModalLabel, { color: textColor, opacity: 0.9 }]}>
              Username
            </Text>
            <TextInput
              style={[styles.editInput, { color: textColor, backgroundColor }]}
              value={editUsername}
              onChangeText={setEditUsername}
              autoCapitalize="none"
              placeholder="Enter username"
              placeholderTextColor="#999"
              editable={!savingAccount}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#eee" }]}
                onPress={() => setShowEditAccountModal(false)}
                disabled={savingAccount}
              >
                <Text style={[styles.modalButtonText, { color: "#115BCA" }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#FF5700" }]}
                onPress={handleSaveAccount}
                disabled={savingAccount}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                  {savingAccount ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
            {displayUsername ? `u/${displayUsername}` : "u/YourUsername"}
          </Text>
          <View style={styles.premiumRow}>
            {isPremium ? (
              <View style={styles.premiumBadge}>
                <Ionicons name="sparkles" size={ms(16)} color="#FF5700" />
                <Text style={styles.premiumBadgeText}>Premium</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => router.push("/Premium")}
                disabled={premiumLoading}
              >
                <Text style={styles.upgradeButtonText}>
                  {premiumLoading ? "Checking..." : "Upgrade"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
          {["Posts", "Communities", "About"].map((t) => (
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
          {tab === "Communities" && (
            <FlatList
              style={{
                height: "50%",
                overflow: "hidden",
              }}
              data={groups}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "#f6f7f8",
                    borderRadius: ms(12),
                    marginBottom: vs(14),
                    padding: s(8),
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image
                      source={{
                        uri: item.image != null ? item.image : undefined,
                      }}
                      style={{
                        width: s(40),
                        aspectRatio: 1,
                        borderRadius: ms(20),
                        marginRight: 10,
                      }}
                    />
                    <Text style={styles.postTitle}>{item.name}</Text>
                  </View>

                  <TouchableOpacity
                    style={{
                      backgroundColor: "#FF5700",
                      paddingVertical: 6,
                      paddingHorizontal: 14,
                      borderRadius: 20,
                      opacity: leavingGroupId === item.id ? 0.6 : 1,
                    }}
                    onPress={() => leaveGroupMutation(item.id)}
                    disabled={leavingGroupId === item.id}
                  >
                    <Text style={{ color: "white", fontWeight: "600" }}>
                      {leavingGroupId === item.id ? "Leaving..." : "Leave"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
          {tab === "About" && (
            <View style={{ gap: vs(12) }}>
              {/* Account settings */}
              <View style={[styles.card, { backgroundColor: profileMdColor, borderColor: "rgba(255,87,0,0.15)" }]}>
                <Text style={[styles.cardTitle, { color: textColor }]}>Account</Text>
                <View style={styles.rowBetween}>
                  <View style={{ gap: vs(6) }}>
                    <Text style={[styles.cardLabel, { color: textColor, opacity: 0.9 }]}>Username</Text>
                    <Text style={[styles.cardValue, { color: textColor }]}>
                      {displayUsername}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.primaryMiniButton, { backgroundColor: "#FF5700" }]}
                    onPress={() => {
                      setEditUsername(displayUsername);
                      setShowEditAccountModal(true);
                    }}
                    disabled={loadingUserProfile}
                  >
                    <Text style={styles.primaryMiniButtonText}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Danger zone */}
              <View style={[styles.card, { backgroundColor: profileMdColor, borderColor: "rgba(255,69,69,0.18)" }]}>
                <Text style={[styles.cardTitle, { color: textColor }]}>Danger Zone</Text>
                <Text style={[styles.dangerText, { color: textColor }]}>
                  Delete your LAPSocial account and remove your profile data from this app.
                </Text>
                <TouchableOpacity
                  style={[styles.dangerButton, { opacity: deletingAccount ? 0.7 : 1 }]}
                  onPress={() => setShowDeleteAccountModal(true)}
                  disabled={deletingAccount}
                >
                  <Text style={styles.dangerButtonText}>
                    {deletingAccount ? "Deleting..." : "Delete account"}
                  </Text>
                </TouchableOpacity>
              </View>
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
    height: "95%",
    borderRadius: s(18),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    alignItems: "center",
    marginTop: vs(32),
    marginBottom: vs(4),
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
  card: {
    width: "100%",
    borderRadius: ms(16),
    padding: s(14),
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
    marginBottom: vs(12),
  },
  cardTitle: {
    fontSize: ms(16),
    fontWeight: "900",
    marginBottom: vs(10),
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: s(12),
  },
  cardLabel: {
    fontSize: ms(13),
    fontWeight: "700",
  },
  cardValue: {
    fontSize: ms(14),
    fontWeight: "900",
    marginTop: vs(4),
  },
  primaryMiniButton: {
    borderRadius: ms(999),
    paddingVertical: vs(8),
    paddingHorizontal: s(14),
  },
  primaryMiniButtonText: {
    color: "white",
    fontWeight: "900",
    fontSize: ms(13),
  },
  dangerText: {
    fontSize: ms(14),
    lineHeight: vs(20),
    opacity: 0.92,
    marginBottom: vs(12),
    fontWeight: "600",
  },
  dangerButton: {
    borderRadius: ms(14),
    paddingVertical: vs(12),
    paddingHorizontal: s(14),
    backgroundColor: "rgba(255,69,69,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,69,69,0.45)",
    alignItems: "center",
  },
  dangerButtonText: {
    color: "#FF3B30",
    fontWeight: "900",
    fontSize: ms(14),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: s(16),
  },
  editModalContent: {
    width: "100%",
    borderRadius: ms(18),
    padding: s(16),
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
  },
  editModalTitle: {
    fontSize: ms(18),
    fontWeight: "900",
    marginBottom: vs(12),
    textAlign: "center",
  },
  editModalLabel: {
    fontSize: ms(13),
    fontWeight: "800",
    marginBottom: vs(8),
  },
  editInput: {
    borderRadius: ms(14),
    paddingHorizontal: s(12),
    paddingVertical: vs(12),
    fontSize: ms(15),
    marginBottom: vs(14),
    borderWidth: 1,
    borderColor: "rgba(255,87,0,0.25)",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: s(10),
  },
  modalButton: {
    flex: 1,
    borderRadius: ms(14),
    paddingVertical: vs(12),
    alignItems: "center",
  },
  modalButtonText: {
    fontWeight: "900",
    fontSize: ms(14),
  },
  premiumRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: vs(10),
    marginTop: vs(6),
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(8),
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
    borderRadius: ms(999),
    backgroundColor: "rgba(255,87,0,0.12)",
  },
  premiumBadgeText: {
    fontSize: ms(14),
    fontWeight: "800",
    color: "#FF5700",
  },
  upgradeButton: {
    backgroundColor: "#FF5700",
    borderRadius: ms(999),
    paddingHorizontal: s(14),
    paddingVertical: vs(8),
  },
  upgradeButtonText: {
    color: "white",
    fontWeight: "900",
    fontSize: ms(14),
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
