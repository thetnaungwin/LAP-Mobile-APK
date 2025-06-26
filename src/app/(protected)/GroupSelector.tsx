import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { ms, s, vs } from "react-native-size-matters";
import { getColorScheme } from "../../config/color";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { fetchGroups } from "../../services/groupService";
import { Tables } from "../../types/database.types";
import NetInfo from "@react-native-community/netinfo";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { getGroup, setGroup } from "../../store/slices/groupSlice";
import { useSupabase } from "../../config/supabase";
import { useUser } from "@clerk/clerk-expo";

type Group = Tables<"groups">;

const GroupSelector = () => {
  const supabase = useSupabase();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const { textColor, backgroundColor } = getColorScheme();
  const groupData = useSelector((state: RootState) => state.group.groupData);
  const dispatch = useDispatch();
  const { user }: any = useUser();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["groups", { searchValue }],
    queryFn: () => fetchGroups(user?.id, searchValue, supabase),
    staleTime: 10_000,
    placeholderData: (previousData) => previousData,
    enabled: isConnected === true,
  });

  useEffect(() => {
    if (data && groupData.length >= 0) {
      dispatch(getGroup(data));
    }
  }, [data, dispatch, groupData]);

  const onGroupSelected = (group: Group) => {
    dispatch(setGroup(group));
    router.back();
  };
  const offlineFilteredGroups = groupData.filter((item: Group) =>
    item.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  if (isLoading) {
    return (
      <View style={{ backgroundColor, flex: 1 }}>
        <ActivityIndicator />
      </View>
    );
  }
  if (error) {
    return (
      <View style={{ backgroundColor, flex: 1 }}>
        <Text style={{ color: textColor }}>Error fetching groups!</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ backgroundColor, flex: 1, paddingHorizontal: s(15) }}
    >
      <View style={styles.container}>
        <AntDesign
          name="close"
          size={ms(24)}
          color={textColor}
          onPress={() => router.back()}
        />
        <Text style={[{ ...styles.postToText, color: textColor }]}>
          Post to
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <AntDesign name="search1" size={ms(24)} color={"gray"} />
        <TextInput
          placeholder="Search for a community"
          placeholderTextColor={"gray"}
          style={{ paddingVertical: vs(10), flex: 1 }}
          value={searchValue}
          onChangeText={setSearchValue}
        />
      </View>

      <FlatList
        data={isConnected ? data : offlineFilteredGroups}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onGroupSelected(item)}
            style={styles.pressableGroups}
          >
            <Image
              source={{ uri: item.image != null ? item.image : undefined }}
              style={{ width: s(40), aspectRatio: 1, borderRadius: ms(20) }}
            />
            <Text style={{ fontWeight: "600", color: textColor }}>
              {item.name}
            </Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  postToText: {
    fontSize: ms(16),
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "lightgray",
    borderRadius: ms(5),
    gap: 5,
    marginVertical: vs(10),
    alignItems: "center",
    paddingHorizontal: s(5),
  },
  pressableGroups: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(5),
    marginBottom: vs(14),
  },
});

export default GroupSelector;
