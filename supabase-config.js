// supabase-config.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://dsxogtkqbqdobkshckjy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzeG9ndGtxYnFkb2Jrc2hja2p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzkyOTMsImV4cCI6MjA3NjgxNTI5M30.Hcpx-DWykTsWY6kw0DyKaY2lppBfAk7X6MJKXeRHwMQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
