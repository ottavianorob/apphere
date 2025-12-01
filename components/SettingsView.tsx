import React from 'react';
// FIX: Removed import from empty mockData file and prepared component to receive categories as props.
import { Category } from '../types';

const SettingsView: React.FC<{ categories: Category[] }> = ({ categories }) => {

  return (
    <div>
        <header className="mb-8 border-b-2 border-[#2D3748] pb-4 text-center">
          <h1 className="font-sans-display text-4xl sm:text-5xl font-bold text-[#2D3748]">Impostazioni</h1>
        </header>
      
      <div className="space-y-8 max-w-2xl mx-auto font-sans-display">
        {/* Categorie Preferite */}
        <div className="border border-gray-300/80 p-6">
          <h2 className="font-serif-display text-2xl italic text-[#134A79] mb-4">Categorie Preferite</h2>
          <p className="font-serif italic text-sm text-gray-600 mb-4">Seleziona le categorie che ti interessano di più per ricevere suggerimenti personalizzati.</p>
          <div className="space-y-3">
            {categories.map(category => (
              <label key={category.id} className="flex items-center">
                <input type="checkbox" className="h-4 w-4 rounded-sm bg-white/50 border-gray-400 text-[#134A79] focus:ring-[#134A79]" />
                <span className="ml-3 text-[#2D3748]">{category.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Notifiche */}
        <div className="border border-gray-300/80 p-6">
          <h2 className="font-serif-display text-2xl italic text-[#134A79] mb-4">Notifiche</h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Notifiche basate sulla posizione</h3>
              <p className="font-serif italic text-sm text-gray-600">Ricevi un avviso quando sei vicino a un punto di interesse.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#134A79]"></div>
            </label>
          </div>
        </div>

        {/* Personalizzazione UI */}
        <div className="border border-gray-300/80 p-6">
          <h2 className="font-serif-display text-2xl italic text-[#134A79] mb-4">Aspetto</h2>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Tema Giornale</h3>
            <p className="text-sm text-gray-700 bg-gray-200 px-3 py-1 font-medium">Attivo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;