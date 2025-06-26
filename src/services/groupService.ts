import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/database.types";

export const fetchGroups = async (
  userId: string,
  search: string,
  supabase: SupabaseClient<Database>
): Promise<any> => {
  //@ts-ignore
  const { data, error } = await supabase.rpc("get_user_groups", {
    user_id_input: userId,
    search_input: search,
  });

  if (error) {
    throw error;
  }

  return data;
};
