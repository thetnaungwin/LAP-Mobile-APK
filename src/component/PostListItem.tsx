import { Image, Pressable, Text, View, StyleSheet } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { formatDistanceToNowStrict } from "date-fns";
import { Link } from "expo-router";
import { ms, s, vs } from "react-native-size-matters";
import { getColorScheme } from "../config/color";
import { Tables } from "../types/database.types";
import { useSupabase } from "../config/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUpvote, selectMyVote } from "../services/upvoteService";
import { useSession } from "@clerk/clerk-expo";
import SupabaseImage from "./SupabaseImage";
import { fetchUsers } from "../services/userService";

type Post = Tables<"posts"> & {
  group: Tables<"groups">;
  upvotes: { sum: number }[];
};

type PostListItemProps = {
  post: Post;
  isDetailedPost?: boolean;
};

export default function PostListItem({
  post,
  isDetailedPost,
}: PostListItemProps) {
  const { groupNameText, textColor } = getColorScheme();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { session } = useSession();
  const shouldShowImage = isDetailedPost || post.image;
  const shouldShowDescription = isDetailedPost || !post.image;

  const { mutate: upvote } = useMutation({
    mutationFn: (value: 1 | -1) => createUpvote(post.id, value, supabase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const { data: User } = useQuery({
    queryKey: ["users", post.id],
    queryFn: () => fetchUsers(supabase),
  });

  const { data: myVote } = useQuery({
    queryKey: ["posts", post.id, "my-upvote"],
    // @ts-ignore
    queryFn: () => selectMyVote(post.id, session?.user.id, supabase),
  });

  const isUpvoted = myVote?.value === 1;
  const isDownvoted = myVote?.value === -1;

  return (
    <Link href={`/post/${post.id}`} asChild>
      <Pressable
        style={{
          paddingHorizontal: s(15),
          paddingVertical: vs(10),
          gap: s(7),
          borderBottomWidth: s(1),
        }}
      >
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            // @ts-ignore
            source={{ uri: post.group.image }}
            style={{
              width: s(20),
              height: vs(20),
              borderRadius: ms(10),
              marginRight: s(5),
            }}
          />
          <View>
            <View style={{ flexDirection: "row", gap: s(5) }}>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: ms(13),
                  color: groupNameText,
                }}
              >
                {post.group.name}
              </Text>
              <Text
                style={{
                  color: "grey",
                  fontSize: ms(13),
                  alignSelf: "flex-start",
                }}
              >
                {/*  @ts-ignore */}
                {formatDistanceToNowStrict(new Date(post.created_at + "Z"))}
              </Text>
            </View>
            {isDetailedPost && (
              <Text style={{ fontSize: ms(13), color: "#2E5DAA" }}>
                {User?.find((item) => item.user_id === post.user_id)
                  ?.user_name || "Anonymous"}
              </Text>
            )}
          </View>
          <Pressable
            onPress={() => console.error("Pressed")}
            style={{
              marginLeft: "auto",
              backgroundColor: "#0d469b",
              borderRadius: s(10),
            }}
          >
            <Text
              style={{
                color: "white",
                paddingVertical: vs(2),
                paddingHorizontal: s(7),
                fontWeight: "bold",
                fontSize: ms(13),
              }}
            >
              Join
            </Text>
          </Pressable>
        </View>

        {/* CONTENT */}
        <Text
          style={{
            fontWeight: "bold",
            fontSize: ms(17),
            letterSpacing: 0.5,
            color: textColor,
          }}
        >
          {post.title}
        </Text>

        {shouldShowImage && post.image && (
          <SupabaseImage
            path={post.image}
            bucket="image"
            style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: ms(15) }}
          />
        )}

        {shouldShowDescription && post.description && (
          <Text
            numberOfLines={isDetailedPost ? undefined : 4}
            style={{ color: textColor }}
          >
            {post.description}
          </Text>
        )}

        {/* FOOTER */}
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", gap: s(10) }}>
            <View style={[{ flexDirection: "row" }, styles.iconBox]}>
              <MaterialCommunityIcons
                name={isUpvoted ? "arrow-up-bold" : "arrow-up-bold-outline"}
                size={ms(19)}
                color={isUpvoted ? "#FF5700" : textColor}
                onPress={() => upvote(1)}
              />
              <Text
                style={{
                  fontWeight: "500",
                  marginLeft: s(5),
                  alignSelf: "center",
                  color: textColor,
                }}
              >
                {post.upvotes[0].sum || 0}
              </Text>
              <View
                style={{
                  width: s(1),
                  backgroundColor: "#D4D4D4",
                  height: vs(14),
                  marginHorizontal: s(7),
                  alignSelf: "center",
                }}
              />
              <MaterialCommunityIcons
                name={
                  isDownvoted ? "arrow-down-bold" : "arrow-down-bold-outline"
                }
                size={ms(19)}
                color={isDownvoted ? "#FF5700" : textColor}
                onPress={() => upvote(-1)}
              />
            </View>
            <View style={[{ flexDirection: "row" }, styles.iconBox]}>
              <MaterialCommunityIcons
                name="comment-outline"
                size={ms(19)}
                color={textColor}
              />
              <Text
                style={{
                  fontWeight: "500",
                  marginLeft: s(5),
                  alignSelf: "center",
                  color: textColor,
                }}
              >
                {/*  @ts-ignore */}
                {post.nr_of_comments?.[0].count}
              </Text>
            </View>
          </View>
          <View
            style={{ marginLeft: "auto", flexDirection: "row", gap: s(10) }}
          >
            <MaterialCommunityIcons
              name="trophy-outline"
              size={ms(19)}
              color={textColor}
              style={styles.iconBox}
            />
            <MaterialCommunityIcons
              name="share-outline"
              size={ms(19)}
              color={textColor}
              style={styles.iconBox}
            />
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    borderWidth: s(0.5),
    borderColor: "#D4D4D4",
    paddingHorizontal: s(10),
    paddingVertical: vs(5),
    borderRadius: s(20),
  },
});
