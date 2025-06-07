import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/database.types";

export const createUpvote = async (
  post_id: string,
  value: 1 | -1,
  supabase: SupabaseClient<Database>
) => {
  const { data, error } = await supabase
    .from("upvotes")
    .upsert({ post_id, value })
    .select()
    .single();

  if (error) {
    throw error;
  } else {
    return data;
  }
};

export const selectMyVote = async (
  post_id: string,
  user_id: string,
  supabase: SupabaseClient<Database>
) => {
  const { data, error } = await supabase
    .from("upvotes")
    .select("*")
    .eq("post_id", post_id)
    .eq("user_id", user_id)
    .single();

  if (error) {
    throw error;
  } else {
    return data;
  }
};
