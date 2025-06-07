import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/database.types";

export const fetchGroups = async (
  search: string,
  supabase: SupabaseClient<Database>
) => {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .ilike("name", `%${search}%`);

  if (error) {
    throw error;
  } else {
    return data;
  }
};
