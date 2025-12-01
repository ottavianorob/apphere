import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const LoginView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
            data: {
                name: email.split('@')[0] // Default name from email
            }
        }
    });
    if (error) setError(error.message);
    else setMessage('Registrazione avvenuta! Controlla la tua email per il link di conferma.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F0] p-4">
      <div className="w-full max-w-md">
        <header className="mb-8 border-b-2 border-[#2D3748] pb-4 text-center">
          <h1 className="font-sans-display text-4xl sm:text-5xl font-bold text-[#2D3748] tracking-tighter">Cosa è successo qui?</h1>
          <p className="font-serif-display italic text-lg text-gray-700 mt-2">Accedi per esplorare</p>
        </header>

        <form className="space-y-4 font-sans-display">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              className="w-full px-3 py-2 mt-1 border border-gray-400 bg-transparent focus:ring-2 focus:ring-[#134A79] focus:border-[#134A79] outline-none"
              type="email"
              placeholder="La tua email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              className="w-full px-3 py-2 mt-1 border border-gray-400 bg-transparent focus:ring-2 focus:ring-[#134A79] focus:border-[#134A79] outline-none"
              type="password"
              placeholder="La tua password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          {message && <p className="text-green-600 text-sm text-center">{message}</p>}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex-1 px-4 py-2 text-white bg-[#134A79] font-sans-display font-semibold hover:bg-[#103a60] transition-colors rounded-md disabled:opacity-50"
            >
              {loading ? 'Accesso...' : 'Accedi'}
            </button>
            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full flex-1 px-4 py-2 text-gray-700 bg-gray-200 font-sans-display font-semibold hover:bg-gray-300 transition-colors rounded-md disabled:opacity-50"
            >
              {loading ? '...' : 'Registrati'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
