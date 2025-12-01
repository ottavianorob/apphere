// Fix TypeScript errors with Vite's import.meta.env by globally augmenting the ImportMeta interface.
// This is a workaround for environments where the standard /// <reference types="vite/client" /> directive fails.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_SUPABASE_URL: string;
      readonly VITE_SUPABASE_ANON_KEY: string;
    };
  }
}

import { createClient } from '@supabase/supabase-js';

// Legge le credenziali di Supabase dalle variabili d'ambiente di Vite.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Lancia un errore chiaro se le credenziali non sono state impostate.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Le credenziali di Supabase (URL e Anon Key) non sono state trovate. Assicurati di aver configurato correttamente le variabili d'ambiente (file .env o segreti di AI Studio).");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);