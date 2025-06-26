import { SupabaseClient } from "@supabase/supabase-js";

type User = {
  user_id: any;
  user_name: string;
};

export const fetchUsers = async (supabase: SupabaseClient): Promise<User[]> => {
  const { data, error } = await supabase.from("users").select("*");

  if (error) {
    throw error;
  } else {
    return data;
  }
};

export const createUser = async (
  supabase: SupabaseClient,
  user: User
): Promise<void> => {
  const { error } = await supabase.from("users").insert([user]);
  if (error) throw error;
};
