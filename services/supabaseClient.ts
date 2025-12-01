import { createClient } from '@supabase/supabase-js';

// Legge le credenziali di Supabase dalle variabili d'ambiente.
// Questo è essenziale per connettersi al TUO progetto Supabase.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Lancia un errore chiaro se le credenziali non sono state impostate.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Le credenziali di Supabase (URL e Anon Key) non sono state trovate. Assicurati di aver configurato correttamente le variabili d'ambiente (file .env o segreti di AI Studio).");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);