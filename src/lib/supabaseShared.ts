import { createClient } from '@supabase/supabase-js';

// Shared Supabase backend from CineVault for cross-app authentication and data
const SUPABASE_URL = 'https://czxribfffjpaozjsrxwr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eHJpYmZmZmpwYW96anNyeHdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NTU4NzgsImV4cCI6MjA4NDUzMTg3OH0.UAtP1vG2ZX7-PcL9MAJilbIqs2BjJTRxCQh0j40MJmE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
