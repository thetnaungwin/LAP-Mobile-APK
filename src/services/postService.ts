import { TablesInsert, Database } from "../types/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

type InsertPost = TablesInsert<"posts">;

export const fetchPosts = async (
  { limit = 20, offset = 0 }: { limit?: number; offset?: number },
  supabase: SupabaseClient<Database>
) => {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "*, group:groups(*), upvotes(value.sum()), nr_of_comments:comments(count)"
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  } else {
    return data;
  }
};

export const fetchPostById = async (
  id: string,
  supabase: SupabaseClient<Database>
) => {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "*, group:groups(*), upvotes(value.sum()), nr_of_comments:comments(count)"
    )
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  } else {
    return data;
  }
};

export const fetchPostByUserId = async (
  user_id: string,
  supabase: SupabaseClient<Database>
) => {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `id,
      title,
      groups (
        name
      ),
      upvotes (
        value
      )`
    )
    .eq("user_id", user_id);

  if (error) {
    throw error;
  } else {
    const postsWithUpvoteCount = data.map((post) => ({
      post_id: post.id,
      title: post.title,
      group_name: post.groups?.name || null,
      upvote_count:
        post.upvotes?.reduce(
          (total: number, upvote: { value: number }) =>
            total + (upvote.value || 0),
          0
        ) || 0,
    }));

    return postsWithUpvoteCount;
  }
};

export const insertPost = async (
  post: InsertPost,
  supabase: SupabaseClient<Database>
) => {
  // use supabase to insert a new post
  const { data, error } = await supabase
    .from("posts")
    .insert(post)
    .select()
    .single();

  if (error) {
    throw error;
  } else {
    return data;
  }
};

export const updatePost = async (
  id: string,
  post: any,
  supabase: SupabaseClient<Database>
) => {
  const { data, error } = await supabase
    .from("posts")
    .update(post)
    .eq("id", id)
    .select();

  if (error) throw error;

  if (!data || data.length === 0) {
    throw new Error("No post found to update");
  }

  return data[0];
};

export const deletePost = async (
  id: string,
  supabase: SupabaseClient<Database>
) => {
  const { data, error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    throw error;
  } else {
    return data;
  }
};
