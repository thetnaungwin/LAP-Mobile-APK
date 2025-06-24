import { View, Text, Image, Pressable, FlatList } from "react-native";
import { Entypo, Octicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { formatDistanceToNowStrict } from "date-fns";
import { getColorScheme } from "../config/color";
import { ms, s, vs } from "react-native-size-matters";
import { useState, memo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../config/supabase";
import { Tables } from "../types/database.types";
import { deleteComment, fetchCommentReplies } from "../services/commentService";
import { useSession } from "@clerk/clerk-expo";

type Comment = Tables<"comments">;

type CommentListItemProps = {
  comment: Comment;
  depth: number;
  handleReplyBtnPressed: (commentId: string) => void;
};

const CommentListItem = ({
  comment,
  depth,
  handleReplyBtnPressed,
}: CommentListItemProps) => {
  const [isShowReplies, setIsShowReplies] = useState<boolean>(false);
  const { textColor, backgroundColor } = getColorScheme();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { session } = useSession();

  const { data: replies } = useQuery({
    queryKey: ["comments", { parentId: comment.id }],
    queryFn: () => fetchCommentReplies(comment.id, supabase),
  });

  const { mutate: removeComment } = useMutation({
    mutationFn: () => deleteComment(comment.id, supabase),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", { postId: comment.post_id }],
      });
      queryClient.invalidateQueries({
        queryKey: ["comments", { parentId: comment.parent_id }],
      });
    },
  });

  console.log("rendering");

  return (
    <View
      style={{
        backgroundColor,
        marginTop: vs(10),
        paddingHorizontal: s(10),
        paddingVertical: vs(5),
        gap: s(10),
        borderLeftColor: backgroundColor,
        borderLeftWidth: depth > 0 ? 1 : 0,
      }}
    >
      {/* User Info */}
      {/* <View style={{ flexDirection: "row", alignItems: "center", gap: s(3) }}>
        <Image
          source={{
            uri:
              comment.user.image ||
              "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/3.jpg",
          }}
          style={{
            width: s(20),
            height: vs(20),
            borderRadius: ms(10),
            marginRight: s(5),
          }}
        />
        <Text style={{ fontWeight: "600", color: "#737373", fontSize: ms(13) }}>
          {comment.user.name}
        </Text>
        <Text style={{ color: "#737373", fontSize: ms(13) }}>&#x2022;</Text>
        <Text style={{ color: "#737373", fontSize: ms(13) }}>
          {formatDistanceToNowStrict(new Date(comment.created_at))}
        </Text>
      </View> */}

      {/* Comment Content */}
      <Text style={{ color: textColor }}>{comment.comment}</Text>

      {/* Comment Actions */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: s(13),
        }}
      >
        {session?.user.id === comment.user_id && (
          <Entypo
            onPress={() => removeComment()}
            name="trash"
            size={ms(16)}
            color="#737373"
          />
        )}
        <Octicons
          name="reply"
          size={ms(16)}
          color="#737373"
          onPress={() => handleReplyBtnPressed(comment.id)}
        />
        <MaterialCommunityIcons
          name="trophy-outline"
          size={ms(16)}
          color="#737373"
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: s(5),
          }}
        >
          <MaterialCommunityIcons
            name="arrow-up-bold-outline"
            size={ms(18)}
            color="#737373"
          />
          <Text style={{ fontWeight: "500", color: "#737373" }}>
            {/* @ts-ignore */}
            {comment.upvotes}
          </Text>
          <MaterialCommunityIcons
            name="arrow-down-bold-outline"
            size={ms(18)}
            color="#737373"
          />
        </View>
      </View>

      {!!replies?.length && !isShowReplies && depth < 5 && (
        <Pressable
          onPress={() => setIsShowReplies(true)}
          style={{
            backgroundColor: "#545454",
            borderRadius: s(2),
            paddingVertical: vs(3),
          }}
        >
          <Text
            style={{
              color: "#EDEDED",
              alignSelf: "center",
              fontSize: ms(12),
              fontWeight: "500",
              letterSpacing: 0.5,
            }}
          >
            Show Replies
          </Text>
        </Pressable>
      )}
      {/* List of reply */}
      {isShowReplies && (
        <FlatList
          data={replies}
          renderItem={({ item }) => (
            <CommentListItem
              comment={item}
              depth={depth + 1}
              handleReplyBtnPressed={handleReplyBtnPressed}
            />
          )}
        />
      )}
    </View>
  );
};

export default memo(CommentListItem);
