import React from 'react';
import PlusIcon from './icons/PlusIcon';
import { Poi, Character, Itinerary } from '../types';

interface ProfileViewProps {
  onAddPoiClick: () => void;
  onAddCharacterClick: () => void;
  onAddItineraryClick: () => void;
  pois: Poi[];
  characters: Character[];
  itineraries: Itinerary[];
}


const ProfileView: React.FC<ProfileViewProps> = ({ 
  onAddPoiClick, 
  onAddCharacterClick, 
  onAddItineraryClick,
  pois,
  characters,
  itineraries 
}) => {
  return (
    <div>
      <header className="mb-8 border-b-2 border-[#2D3748] pb-4 text-center">
        <h1 className="font-sans-display text-4xl sm:text-5xl font-bold text-[#2D3748]">Profilo</h1>
      </header>

      <div className="max-w-2xl mx-auto space-y-8 font-sans-display">
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

        {/* Database Data Viewer */}
        <div className="border border-gray-300/80 p-6">
          <h2 className="font-serif-display text-2xl italic text-[#134A79] mb-4">Dati nel Database</h2>
           <div className="space-y-2">
              <details className="bg-white/50 border border-gray-300/60 p-2 rounded-md">
                <summary className="font-semibold cursor-pointer">Luoghi ({pois.length})</summary>
                <pre className="mt-2 p-2 bg-gray-100 text-xs overflow-x-auto"><code>{JSON.stringify(pois, null, 2)}</code></pre>
              </details>
              <details className="bg-white/50 border border-gray-300/60 p-2 rounded-md">
                <summary className="font-semibold cursor-pointer">Personaggi ({characters.length})</summary>
                <pre className="mt-2 p-2 bg-gray-100 text-xs overflow-x-auto"><code>{JSON.stringify(characters, null, 2)}</code></pre>
              </details>
              <details className="bg-white/50 border border-gray-300/60 p-2 rounded-md">
                <summary className="font-semibold cursor-pointer">Itinerari ({itineraries.length})</summary>
                <pre className="mt-2 p-2 bg-gray-100 text-xs overflow-x-auto"><code>{JSON.stringify(itineraries, null, 2)}</code></pre>
              </details>
           </div>
        </div>

        {/* Settings from old page */}
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