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

export const updateJoinedGroup = async (
  userId: string,
  groupId: string,
  supabase: SupabaseClient
) => {
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("joinedgroup")
    .eq("user_id", userId)
    .single();

  if (userError) {
    console.error("Failed to fetch user:", userError);
    throw userError;
  }

  const currentGroups: string[] = userData?.joinedgroup ?? [];

  if (currentGroups.includes(groupId)) {
    console.log("Already joined.");
    return;
  }

  const updatedGroups = [...currentGroups, groupId];

  const { error: updateError } = await supabase
    .from("users")
    .update({ joinedgroup: updatedGroups }) // also lowercase here
    .eq("user_id", userId);

  if (updateError) {
    console.error("Update failed:", updateError);
    throw updateError;
  }
};
