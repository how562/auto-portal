import { createClient } from "@supabase/supabase-js";

// External Supabase project (publishable key — safe to ship to client)
const SUPABASE_URL = "https://faantdhcxnnuwuwkaxbq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_S9K7wNHmDay3WDLO_oxzsA_WF0eJ85m";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});
