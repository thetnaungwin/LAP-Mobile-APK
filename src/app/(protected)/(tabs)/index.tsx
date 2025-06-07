import {
  View,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Text,
} from "react-native";
import React, { useEffect, useState } from "react";
import PostListItem from "../../../component/PostListItem";
import { getColorScheme } from "../../../config/color";
import { RootState } from "../../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPosts } from "../../../services/postService";
import { getPost } from "../../../store/slices/postSlice";
import NetInfo from "@react-native-community/netinfo";
import { useSupabase } from "../../../config/supabase";

const HomeScreen = () => {
  const supabase = useSupabase();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const { backgroundColor, barStyle } = getColorScheme();
  const postData = useSelector((state: RootState) => state.post.postData);
  const dispatch = useDispatch();

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
      />
    </View>
  );
};

export default HomeScreen;
