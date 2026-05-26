type SupabaseEnv = {
  supabasePublishableKey: string;
  supabaseUrl: string;
};

export function getSupabaseEnv(): SupabaseEnv {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local before using Supabase features.",
    );
  }

  return {
    supabasePublishableKey,
    supabaseUrl,
  };
}
