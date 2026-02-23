import { createClient } from '@supabase/supabase-js';

// These will be populated from localStorage settings in our implementation
// to allow dynamic configuration without env vars for this specific demo setup
export const getSupabaseClient = (url: string, key: string) => {
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      fetch: (...args) => window.fetch(...args)
    }
  });
};