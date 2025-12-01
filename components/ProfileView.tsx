import React from 'react';
import UserIcon from './icons/UserIcon';
import PlusIcon from './icons/PlusIcon';

interface ProfileViewProps {
  onAddPoiClick: () => void;
  onAddCharacterClick: () => void;
  onAddItineraryClick: () => void;
}


const ProfileView: React.FC<ProfileViewProps> = ({ onAddPoiClick, onAddCharacterClick, onAddItineraryClick }) => {
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
          <h2 className="font-sans-display text-2xl font-bold text-[#134A79]">Mario Rossi</h2>
          <p className="text-gray-600">mario.rossi@email.com</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 border border-gray-300/80">
            <p className="text-2xl font-bold text-[#134A79]">12</p>
            <p className="text-sm text-gray-600">Luoghi Visitati</p>
          </div>
          <div className="p-4 border border-gray-300/80">
            <p className="text-2xl font-bold text-[#134A79]">5</p>
            <p className="text-sm text-gray-600">Preferiti</p>
          </div>
          <div className="p-4 border border-gray-300/80">
            <p className="text-2xl font-bold text-[#134A79]">2</p>
            <p className="text-sm text-gray-600">Contributi</p>
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