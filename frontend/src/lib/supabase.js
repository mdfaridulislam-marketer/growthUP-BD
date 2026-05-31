// ══════════════════════════════════════════════════
// Supabase Client — Frontend (Anon Key ব্যবহার করে)
// ══════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
