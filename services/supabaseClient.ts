import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kftxgyixojqjjrrsiyib.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdHhneWl4b2pxampycnNpeWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzAzODMsImV4cCI6MjA3OTg0NjM4M30.Do_3IHpmpjgRyJGFeyJPwblTXL_9YmO3PvYoLPFwi4E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
