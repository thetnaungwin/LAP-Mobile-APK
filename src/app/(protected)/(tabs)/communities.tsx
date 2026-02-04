import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSupabase } from "../../../config/supabase";
import { useUser } from "@clerk/clerk-expo";
import { getColorScheme } from "../../../config/color";
import { useTabHeaderPadding } from "../../../hooks/useTabHeaderPadding";
import { updateJoinedGroup } from "../../../services/userService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchGroups } from "../../../services/groupService";
import { ms, s, vs } from "react-native-size-matters";

const CommunitiesScreen = () => {
  const supabase = useSupabase();
  const navigation = useNavigation();
  const { user }: any = useUser();
  const queryClient = useQueryClient();
  const topPadding = useTabHeaderPadding();
  const tabBarHeight = useBottomTabBarHeight();
  const lastOffset = useRef(0);
  const { backgroundColor, textColor, groupNameText, groupBoxColor } =
    getColorScheme();
  const [groups, setGroups] = useState<any[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const baseTabBarStyle =
    Platform.OS === "ios"
      ? {
          position: "absolute" as const,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "transparent" as const,
          borderTopWidth: 0,
        }
      : { backgroundColor, borderTopWidth: 0 };

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const direction = currentOffset > lastOffset.current ? "down" : "up";
    lastOffset.current = currentOffset;
    if (direction === "down" && currentOffset > 0) {
      navigation.setOptions({
        tabBarStyle: { ...baseTabBarStyle, display: "none" },
      });
    } else if (direction === "up") {
      navigation.setOptions({
        tabBarStyle: { ...baseTabBarStyle, display: "flex" },
      });
    }
  };

  // Fetch all groups
  useEffect(() => {
    const loadGroups = async () => {
      setGroupsLoading(true);
      const { data, error } = await supabase.from("groups").select("*");
      setGroups(data || []);
      setGroupsLoading(false);
    };
    loadGroups();
  }, []);

  // Fetch joined groups using useQuery and fetchGroups
  const { data: joinedData, isLoading } = useQuery({
    queryKey: ["groups", user?.id],
    queryFn: () => fetchGroups(user?.id, "", supabase),
    staleTime: 10_000,
    placeholderData: (previousData) => previousData,
  });

  const joinedGroups = joinedData?.map((g: any) => g.id) || [];

  // Clear joiningId once the refetched data includes this group (avoids flashing "Join")
  useEffect(() => {
    if (joiningId && joinedGroups.includes(joiningId)) {
      setJoiningId(null);
    }
  }, [joiningId, joinedGroups]);

  // UseMutation for joining a group
  const { mutate: joinGroup, isPending } = useMutation({
    mutationFn: (groupId: string) =>
      updateJoinedGroup(user.id, groupId, supabase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", user?.id] });
    },
  });

  if (isLoading || groupsLoading) {
    return (
      <View style={[{ ...styles.centered, backgroundColor }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <FlatList
        data={groups}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          paddingTop: topPadding,
          paddingBottom: Platform.OS === "ios" ? (tabBarHeight ?? 0) + 16 : vs(28),
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          const isJoined = joinedGroups.includes(item.id);
          const isJoiningThis = joiningId === item.id;
          const showAsJoined = isJoined || (isJoiningThis && !isPending);
          const buttonLabel =
            isJoiningThis && isPending
              ? "Joining..."
              : showAsJoined
                ? "Joined"
                : "Join";
          return (
            <View style={[{ ...styles.card, backgroundColor: groupBoxColor }]}>
              <Image
                source={{ uri: item.image }}
                style={styles.groupImage}
                resizeMode="cover"
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.groupName, { color: groupNameText }]}>
                  {item.name}
                </Text>
                <Text style={[styles.groupDesc, { color: textColor }]}>
                  {item.description || "No description"}
                </Text>
              </View>
              <Pressable
                style={[
                  styles.joinButton,
                  showAsJoined && styles.joinedButton,
                  isJoiningThis && isPending && styles.joiningButton,
                ]}
                onPress={() => {
                  if (!showAsJoined && !isPending) {
                    setJoiningId(item.id);
                    joinGroup(item.id);
                  }
                }}
                disabled={showAsJoined || (isJoiningThis && isPending)}
              >
                <Text
                  style={{
                    color: showAsJoined ? "#aaa" : "#fff",
                    fontWeight: "bold",
                    fontSize: ms(14),
                  }}
                >
                  {buttonLabel}
                </Text>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text
            style={{ textAlign: "center", marginTop: vs(20), color: textColor }}
          >
            No groups found.
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: s(10), paddingTop: vs(10) },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 18,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: s(15),
    padding: s(12),
    marginBottom: vs(12),
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  groupImage: {
    width: s(50),
    height: s(50),
    borderRadius: 27,
    backgroundColor: "#eee",
  },
  groupName: {
    fontSize: ms(16),
    fontWeight: "bold",
    marginBottom: vs(4),
  },
  groupDesc: {
    fontSize: ms(13),
    color: "#bbb",
  },
  joinButton: {
    backgroundColor: "#007AFF",
    paddingVertical: vs(7),
    paddingHorizontal: s(16),
    borderRadius: s(10),
    marginLeft: s(10),
  },
  joinedButton: {
    backgroundColor: "#ddd",
  },
  joiningButton: {
    backgroundColor: "#aaa",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CommunitiesScreen;
