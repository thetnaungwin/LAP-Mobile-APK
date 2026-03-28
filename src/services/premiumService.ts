import { SupabaseClient } from "@supabase/supabase-js";

const normalizePremiumFromRow = (row: any): boolean => {
  if (!row) return false;

  // Support whichever column name you added in Supabase.
  // Prefer boolean flag.
  if (typeof row.is_premium === "boolean") return row.is_premium;

  // Or allow plan string.
  if (typeof row.plan === "string") {
    return row.plan.toLowerCase().includes("premium");
  }

  return false;
};

export const fetchPremiumStatus = async (
  userId: string,
  supabase: SupabaseClient<any>
): Promise<boolean> => {
  // Your code currently inserts into `users` with `user_id`, but
  // the generated Supabase types may be different. We defensively try both.
  const tryByUserId = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  };

  const tryById = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  };

  try {
    const row = await tryByUserId();
    return normalizePremiumFromRow(row);
  } catch {
    const row = await tryById();
    return normalizePremiumFromRow(row);
  }
};

// MVP/test helper: flips premium on the client.
// For real subscriptions, you should do this through a server-side payment webhook.
export const setPremiumStatus = async (
  userId: string,
  isPremium: boolean,
  supabase: SupabaseClient<any>
): Promise<void> => {
  const tryFilterByUserId = async () => {
    // Try boolean first.
    const { error: boolError } = await supabase
      .from("users")
      .update({ is_premium: isPremium })
      .eq("user_id", userId);

    if (!boolError) return;

    // Fallback to plan string.
    const { error: planError } = await supabase
      .from("users")
      .update({ plan: isPremium ? "premium" : "normal" })
      .eq("user_id", userId);

    if (planError) throw planError;
  };

  const tryFilterById = async () => {
    const { error: boolError } = await supabase
      .from("users")
      .update({ is_premium: isPremium })
      .eq("id", userId);

    if (!boolError) return;

    const { error: planError } = await supabase
      .from("users")
      .update({ plan: isPremium ? "premium" : "normal" })
      .eq("id", userId);

    if (planError) throw planError;
  };

  try {
    await tryFilterByUserId();
  } catch {
    await tryFilterById();
  }
};

