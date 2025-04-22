// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Regular anonymous client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a client with authentication
// lib/supabaseClient.ts - Updated version
export const createClientWithSessionToken = (token?: string) => {
  if (!token) {
    return supabase; // Return the anonymous client if no token
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      // Set the auth token directly
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};
