import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xqyzzujbfzuzdbhauhcn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_GpWwn2ycs3dmdeOBQv2gpw_1vG_RtO6';

const globalKey = '__supabase_singleton__';
const g = globalThis as any;

if (!g[globalKey]) {
  g[globalKey] = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });
}

export const supabase: SupabaseClient = g[globalKey];