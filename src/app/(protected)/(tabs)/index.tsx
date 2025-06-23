import {
  View,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Text,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import PostListItem from "../../../component/PostListItem";
import { getColorScheme } from "../../../config/color";
import { RootState } from "../../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPosts } from "../../../services/postService";
import { getPost } from "../../../store/slices/postSlice";
import NetInfo from "@react-native-community/netinfo";
import { useSupabase } from "../../../config/supabase";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
  const supabase = useSupabase();
  const navigation = useNavigation();
  const lastOffset = useRef(0);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const { backgroundColor, barStyle } = getColorScheme();
  const postData = useSelector((state: RootState) => state.post.postData);
  const dispatch = useDispatch();

  const baseTabBarStyle = {
    backgroundColor,
    borderTopColor: backgroundColor,
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam = { limit: 10, offset: 0 } }) =>
      fetchPosts(pageParam, supabase),
    enabled: isConnected === true,
    initialPageParam: { limit: 10, offset: 0 },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 0) return undefined;
      return {
        limit: 2,
        offset: allPages.flat().length,
      };
    },
  });

  const posts = data?.pages.flat();

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (posts && postData.length >= 0) {
        dispatch(getPost(posts));
      }
    }, 10000);
    return () => clearInterval(intervalId);
  }, [posts]);

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

  console.log("Rendering in main post index file");

  if (isLoading) {
    return (
      <View style={{ backgroundColor, flex: 1 }}>
        <StatusBar
          barStyle={barStyle as "default"}
          backgroundColor={backgroundColor}
        />
        <ActivityIndicator />
      </View>
    );
  }

  if (error && posts != undefined) {
    return (
      <View style={{ backgroundColor, flex: 1 }}>
        <StatusBar
          barStyle={barStyle as "default"}
          backgroundColor={backgroundColor}
        />
        <Text>Error fetching posts</Text>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor }}>
      <StatusBar
        barStyle={barStyle as "default"}
        backgroundColor={backgroundColor}
      />
      <FlatList
        data={posts == undefined || !isConnected ? postData : posts}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <PostListItem post={item} />}
        onRefresh={refetch}
        refreshing={isRefetching}
        onEndReachedThreshold={2}
        onEndReached={() =>
          !isFetchingNextPage && hasNextPage && fetchNextPage()
        }
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
};

export default HomeScreen;
