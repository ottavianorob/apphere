import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      alert('Controlla la tua email per il link di accesso!');
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <header className="mb-8 border-b-2 border-[#2D3748] pb-4 text-center">
        <h1 className="font-sans-display text-4xl sm:text-5xl font-bold text-[#2D3748]">Profilo</h1>
        <p className="font-serif-display italic text-lg text-gray-700 mt-2">Accedi per contribuire</p>
      </header>
      
      <div className="border border-gray-300/80 p-6 font-sans-display">
        <p className="font-serif italic text-center text-gray-600 mb-6">
          Inserisci la tua email per ricevere un "magic link" che ti permetterà di accedere istantaneamente, senza bisogno di password.
        </p>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Indirizzo Email</label>
            <input
              id="email"
              className="w-full px-3 py-2 border border-gray-300 bg-white/50 focus:ring-1 focus:ring-[#134A79] focus:border-[#134A79] outline-none"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="latuaemail@esempio.com"
              required
              disabled={loading}
            />
          </div>
          <div>
            <button 
              className="w-full px-4 py-2 text-white bg-[#134A79] font-sans-display font-semibold hover:bg-[#103a60] transition-colors rounded-md disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Invio in corso...' : 'Invia Magic Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
