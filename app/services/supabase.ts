import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hjjfffpgwmitvttpinuk.supabase.co';
const supabaseAnonKey = 'sb_publishable_vYWhADZxygirWryjcJuOHA_WotClOhr';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});