import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
  StyleSheet,
} from "react-native";
import { useSupabase } from "../../../config/supabase";
import { useUser } from "@clerk/clerk-expo";
import { getColorScheme } from "../../../config/color";
import { updateJoinedGroup } from "../../../services/userService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchGroups } from "../../../services/groupService";
import { s, vs } from "react-native-size-matters";

const CommunitiesScreen = () => {
  const supabase = useSupabase();
  const { user }: any = useUser();
  const queryClient = useQueryClient();
  const { backgroundColor, textColor, groupNameText, groupBoxColor } =
    getColorScheme();
  const [groups, setGroups] = useState<any[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

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
        renderItem={({ item }) => {
          const isJoined = joinedGroups.includes(item.id);
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
                  isJoined && styles.joinedButton,
                  isPending && joiningId === item.id && styles.joiningButton,
                ]}
                onPress={() => {
                  if (!isJoined && !isPending) {
                    setJoiningId(item.id);
                    joinGroup(item.id, {
                      onSettled: () => setJoiningId(null),
                    });
                  }
                }}
                disabled={isJoined || (isPending && joiningId === item.id)}
              >
                <Text
                  style={{
                    color: isJoined ? "#aaa" : "#fff",
                    fontWeight: "bold",
                  }}
                >
                  {isPending && joiningId === item.id
                    ? "Joining..."
                    : isJoined
                    ? "Joined"
                    : "Join"}
                </Text>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text
            style={{ textAlign: "center", marginTop: 40, color: textColor }}
          >
            No groups found.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 30 }}
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
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  groupImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#eee",
  },
  groupName: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 4,
  },
  groupDesc: {
    fontSize: 13,
    color: "#bbb",
  },
  joinButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginLeft: 10,
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
