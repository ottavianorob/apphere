import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthView: React.FC = () => {
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
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            setError(error.message);
        } else {
            setMessage('Registrazione avvenuta! Controlla la tua email per il link di conferma.');
        }
        setLoading(false);
    };

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
         if (!email) {
            setError("Per favore, inserisci un'email per ricevere il magic link.");
            return;
        }
        setError(null);
        setMessage(null);
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) {
            setError(error.message);
        } else {
            setMessage('Link magico inviato! Controlla la tua email.');
        }
        setLoading(false);
    };

    const inputStyle = "w-full px-3 py-2 border border-gray-400 bg-transparent focus:ring-2 focus:ring-[#134A79] focus:border-[#134A79] outline-none font-sans-display";
    const buttonStyle = "w-full px-4 py-2 text-white bg-[#134A79] font-sans-display font-semibold hover:bg-[#103a60] transition-colors rounded-md disabled:opacity-50";

    return (
        <div className="max-w-md mx-auto mt-8">
            <header className="mb-8 border-b-2 border-[#2D3748] pb-4 text-center">
                <h1 className="font-sans-display text-4xl sm:text-5xl font-bold text-[#2D3748]">Accedi</h1>
                <p className="font-serif-display italic text-lg text-gray-700 mt-2">o registrati per contribuire</p>
            </header>

            <div className="p-6 border border-gray-300/80">
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="font-sans-display text-sm font-semibold text-gray-700 mb-1 block" htmlFor="email">Email</label>
                        <input id="email" className={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <label className="font-sans-display text-sm font-semibold text-gray-700 mb-1 block" htmlFor="password">Password</label>
                        <input id="password" className={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    
                    {error && <p className="text-sm text-red-600 font-sans-display">{error}</p>}
                    {message && <p className="text-sm text-green-600 font-sans-display">{message}</p>}

                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <button className={buttonStyle} type="submit" disabled={loading}>
                            {loading ? 'Caricamento...' : 'Login'}
                        </button>
                        <button onClick={handleSignup} className={`${buttonStyle} bg-gray-600 hover:bg-gray-700`} type="button" disabled={loading}>
                            {loading ? '...' : 'Registrati'}
                        </button>
                    </div>
                     <div className="text-center pt-2">
                        <button onClick={handleMagicLink} className="text-sm text-[#134A79] hover:underline font-sans-display" type="button" disabled={loading}>
                           {loading ? '...' : 'Invia Magic Link'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthView;