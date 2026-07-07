import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Check your .env.local (dev) or Vercel Environment Variables (production)."
  );
}

// The anon key is DESIGNED to be public — it ships in the browser bundle.
// Real security comes from the Row Level Security (RLS) policies on the
// Supabase tables/storage buckets (see schema.sql), not from hiding this key.
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const PRODUCTS_TABLE = "products";
export const IMAGE_BUCKET = "product-images";
