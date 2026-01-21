import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let currentClerkUserId: string | null = null;

// Create a supabase client factory that includes the clerk user id header
export const createAuthenticatedClient = (clerkUserId: string | null) => {
  const headers: Record<string, string> = {};
  
  if (clerkUserId) {
    headers['x-clerk-user-id'] = clerkUserId;
  }
  
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers,
    },
  });
};

// Set the current clerk user id for future requests
export const setClerkUserId = (userId: string | null) => {
  currentClerkUserId = userId;
};

// Get a supabase client with the current clerk user id
export const getAuthenticatedSupabase = () => {
  return createAuthenticatedClient(currentClerkUserId);
};

// For convenience, export a function that returns current user id
export const getCurrentClerkUserId = () => currentClerkUserId;
