import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import UserIcon from './icons/UserIcon';
import PlusIcon from './icons/PlusIcon';
import { User } from '../types';

interface ProfileViewProps {
  session: Session | null;
  onLogout: () => void;
  onAddPoiClick: () => void;
  onAddCharacterClick: () => void;
  onAddItineraryClick: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ session, onLogout, onAddPoiClick, onAddCharacterClick, onAddItineraryClick }) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
      const fetchProfile = async () => {
          if (session?.user) {
              try {
                  setLoading(true);
                  const { data, error, status } = await supabase
                      .from('profiles')
                      .select(`name, avatar_url, contributions`)
                      .eq('id', session.user.id)
                      .single();

                  if (error && status !== 406) throw error;
                  
                  if (data) {
                      setProfile({
                          id: session.user.id,
                          name: data.name,
                          avatarUrl: data.avatar_url,
                          contributions: data.contributions,
                      });
                  }
              } catch (error) {
                  console.error("Error fetching profile:", error);
              } finally {
                  setLoading(false);
              }
          }
      };
      fetchProfile();
  }, [session]);
  
  return (
    <div>
      <header className="mb-8 border-b-2 border-[#2D3748] pb-4 text-center">
        <h1 className="font-sans-display text-4xl sm:text-5xl font-bold text-[#2D3748]">Profilo</h1>
      </header>

      <div className="max-w-2xl mx-auto space-y-8 font-sans-display">
        {/* User Info */}
        <div className="flex flex-col items-center text-center p-6 border border-gray-300/80">
          <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mb-4 overflow-hidden">
             {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
                <UserIcon className="w-12 h-12 text-gray-500" />
            )}
          </div>
          <h2 className="font-sans-display text-2xl font-bold text-[#134A79]">{loading ? '...' : (profile?.name || 'Utente')}</h2>
          <p className="text-gray-600">{session?.user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
           <div className="p-4 border border-gray-300/80">
            <p className="text-2xl font-bold text-[#134A79]">{loading ? '...' : (profile?.contributions || 0)}</p>
            <p className="text-sm text-gray-600">Contributi</p>
          </div>
           <div className="p-4 border border-gray-300/80">
            <p className="text-2xl font-bold text-[#134A79]">0</p>
            <p className="text-sm text-gray-600">Preferiti</p>
          </div>
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


        {/* Settings and Logout */}
        <div className="border border-gray-300/80 p-6">
          <h2 className="font-serif-display text-2xl italic text-[#134A79] mb-4">Impostazioni</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Notifiche sulla posizione</h3>
              <p className="font-serif italic text-sm text-gray-600">Ricevi un avviso quando sei vicino a un POI.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#134A79]"></div>
            </label>
          </div>
          <button
              onClick={onLogout}
              className="w-full mt-4 px-4 py-2 text-red-700 bg-red-100 border border-red-200 font-sans-display font-semibold hover:bg-red-200 transition-colors rounded-md"
          >
              Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;