import {
  View,
  KeyboardAvoidingView,
  Platform,
  Text,
  StatusBar,
  ActivityIndicator,
  Alert,
  FlatList,
  TextInput,
  Pressable,
} from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useRef, useState, useCallback } from "react";
import PostListItem from "../../../component/PostListItem";
import CommentListItem from "../../../component/CommentListItem";
import { getColorScheme } from "../../../config/color";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deletePost, fetchPostById } from "../../../services/postService";
import { useSupabase } from "../../../config/supabase";
import { AntDesign, Entypo, MaterialIcons } from "@expo/vector-icons";
import { ms, s, vs } from "react-native-size-matters";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchComments, insertComment } from "../../../services/commentService";
import { useSession } from "@clerk/clerk-expo";

const DetailedPost = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [comment, setComment] = useState<string>("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const inputRef = useRef<TextInput | null>(null);
  const { backgroundColor } = getColorScheme();
  const insets = useSafeAreaInsets();
  const { session } = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", id],
    queryFn: () => fetchPostById(id, supabase),
  });

  const { data: comments } = useQuery({
    queryKey: ["comments", { postId: id }],
    queryFn: () => fetchComments(id, supabase),
  });

  const { mutate: remove } = useMutation({
    mutationFn: () => deletePost(id, supabase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.back();
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const { mutate: createComment } = useMutation({
    mutationFn: () =>
      insertComment({ comment, post_id: id, parent_id: replyToId }, supabase),
    onSuccess: (data) => {
      setComment("");
      setReplyToId(null);
      queryClient.invalidateQueries({ queryKey: ["comments", { postId: id }] });
      queryClient.invalidateQueries({
        queryKey: ["comments", { parentId: replyToId }],
      });
    },
  });

  const handleReplyBtnPressed = useCallback((commentId: string) => {
    console.log("Replying to comment:", commentId);
    setReplyToId(commentId);
    inputRef.current?.focus();
  }, []);

  if (isLoading) {
    return (
      <View style={{ backgroundColor, flex: 1 }}>
        <StatusBar backgroundColor={"#FF5700"} />
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={{ backgroundColor, flex: 1 }}>
        <StatusBar backgroundColor={"#FF5700"} />
        <Text>Post Not Found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={insets.top + 10}
      style={{ backgroundColor, flex: 1 }}
    >
      <StatusBar backgroundColor={"#FF5700"} />
      <Stack.Screen
        options={{
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                gap: s(10),
              }}
            >
              {session?.user.id === data.user_id && (
                <Entypo
                  onPress={() => remove()}
                  name="trash"
                  size={ms(22)}
                  color="white"
                />
              )}

              <AntDesign name="search1" size={ms(24)} color={"white"} />
              <MaterialIcons name="sort" size={ms(24)} color={"white"} />
              <Entypo
                name="dots-three-horizontal"
                size={ms(24)}
                color={"white"}
              />
            </View>
          ),
        }}
      />

      <FlatList
        data={comments}
        renderItem={({ item }) => (
          <CommentListItem
            comment={item}
            depth={0}
            handleReplyBtnPressed={handleReplyBtnPressed}
          />
        )}
        ListHeaderComponent={<PostListItem post={data} isDetailedPost />}
      />
      <View
        style={{
          paddingBottom: insets.bottom,
          borderBottomColor: "lightgray",
          padding: s(10),
          backgroundColor,
          borderRadius: ms(10),
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -3,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 4,
        }}
      >
        <TextInput
          placeholder="Join the conversation"
          value={comment}
          onChangeText={setComment}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          ref={inputRef}
          multiline
          style={{
            backgroundColor: "lightgray",
            padding: s(5),
            borderRadius: ms(5),
          }}
        />
        {isInputFocused && (
          <Pressable
            onPress={() => createComment()}
            style={{
              backgroundColor: "#0d469b",
              borderRadius: ms(15),
              marginLeft: "auto",
              marginTop: vs(10),
            }}
          >
            <Text
              style={{
                color: "white",
                paddingVertical: vs(5),
                paddingHorizontal: s(10),
                fontWeight: "bold",
                fontSize: ms(13),
              }}
            >
              Reply
            </Text>
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default DetailedPost;
