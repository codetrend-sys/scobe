import { createClient } from '@supabase/supabase-js';

// Ces valeurs doivent être définies dans ton fichier .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variables Supabase manquantes. Vérifie ton fichier .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
