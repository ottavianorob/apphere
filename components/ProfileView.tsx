import React from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import UserIcon from './icons/UserIcon';
import PlusIcon from './icons/PlusIcon';
import AuthView from './AuthView';

interface ProfileViewProps {
  session: Session | null;
  onAddPoiClick: () => void;
  onAddCharacterClick: () => void;
  onAddItineraryClick: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ session, onAddPoiClick, onAddCharacterClick, onAddItineraryClick }) => {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Errore durante il logout:", error);
    }
  };

  if (!session) {
    return <AuthView />;
  }
  
  return (
    <div>
      <header className="mb-8 border-b-2 border-[#2D3748] pb-4 text-center">
        <h1 className="font-sans-display text-4xl sm:text-5xl font-bold text-[#2D3748]">Profilo</h1>
      </header>

      <div className="max-w-2xl mx-auto space-y-8 font-sans-display">
        {/* User Info */}
        <div className="flex flex-col items-center text-center p-6 border border-gray-300/80">
          <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mb-4">
            <UserIcon className="w-12 h-12 text-gray-500" />
          </div>
          <h2 className="font-sans-display text-xl font-bold text-[#134A79] break-all">{session.user.email}</h2>
          <button onClick={handleLogout} className="mt-4 px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors">
            Logout
          </button>
        </div>

        {/* Content Management */}
        <div className="border border-gray-300/80 p-6">
          <h2 className="font-serif-display text-2xl italic text-[#134A79] mb-4">Gestione Contenuti</h2>
          <p className="font-serif italic text-sm text-gray-600 mb-4">Contribuisci alla mappa della memoria collettiva aggiungendo nuovi contenuti.</p>
          <div className="space-y-3">
            <button onClick={onAddPoiClick} className="w-full text-left flex items-center gap-3 p-3 rounded-md bg-white hover:bg-gray-100 transition-colors border border-gray-300">
              <PlusIcon className="w-5 h-5 flex-shrink-0 text-[#134A79]" />
              <span className="font-sans-display font-semibold text-gray-800">Aggiungi un nuovo Luogo</span>
            </button>
            <button onClick={onAddCharacterClick} className="w-full text-left flex items-center gap-3 p-3 rounded-md bg-white hover:bg-gray-100 transition-colors border border-gray-300">
              <PlusIcon className="w-5 h-5 flex-shrink-0 text-[#134A79]" />
              <span className="font-sans-display font-semibold text-gray-800">Aggiungi un nuovo Personaggio</span>
            </button>
            <button onClick={onAddItineraryClick} className="w-full text-left flex items-center gap-3 p-3 rounded-md bg-white hover:bg-gray-100 transition-colors border border-gray-300">
              <PlusIcon className="w-5 h-5 flex-shrink-0 text-[#134A79]" />
              <span className="font-sans-display font-semibold text-gray-800">Aggiungi un nuovo Itinerario</span>
            </button>
          </div>
        </div>

        {/* Settings */}
        <div className="border border-gray-300/80 p-6">
          <h2 className="font-serif-display text-2xl italic text-[#134A79] mb-4">Notifiche</h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Notifiche sulla posizione</h3>
              <p className="font-serif italic text-sm text-gray-600">Ricevi un avviso quando sei vicino a un POI.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#134A79]"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;