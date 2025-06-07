import { TablesInsert, Database } from "../types/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

type InsertPost = TablesInsert<"posts">;

export const fetchPosts = async (
  { limit = 10, offset = 0 }: { limit?: number; offset?: number },
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
