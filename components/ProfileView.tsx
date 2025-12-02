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
  const tableHeaderStyle = "p-2 font-semibold text-left border-b-2 border-gray-300";
  const tableCellStyle = "p-2 border-b border-gray-200";

  return (
    <div>
      <header className="mb-8 border-b-2 border-[#2D3748] pb-4 text-center">
        <h1 className="font-sans-display text-4xl sm:text-5xl font-bold text-[#2D3748]">Profilo</h1>
        <p className="font-sans-display text-sm text-gray-600 mt-2">Gestisci i contenuti e visualizza i dati dell'applicazione.</p>
      </header>

      <div className="max-w-4xl mx-auto space-y-8 font-sans-display">
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
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className={tableHeaderStyle}>Titolo</th>
                        <th className={tableHeaderStyle}>Tipo</th>
                        <th className={tableHeaderStyle}>Autore</th>
                        <th className={tableHeaderStyle}>Data Evento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pois.map(poi => (
                        <tr key={poi.id}>
                          <td className={tableCellStyle}>{poi.title}</td>
                          <td className={tableCellStyle}>{poi.type}</td>
                          <td className={tableCellStyle}>{poi.author}</td>
                          <td className={tableCellStyle}>{poi.eventDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
              <details className="bg-white/50 border border-gray-300/60 p-2 rounded-md">
                <summary className="font-semibold cursor-pointer">Personaggi ({characters.length})</summary>
                 <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className={tableHeaderStyle}>Nome</th>
                        <th className={tableHeaderStyle}>Descrizione</th>
                        <th className={tableHeaderStyle}>Wikipedia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {characters.map(char => (
                        <tr key={char.id}>
                          <td className={tableCellStyle}>{char.name}</td>
                          <td className={tableCellStyle}>{char.description.substring(0, 70)}...</td>
                          <td className={tableCellStyle}><a href={char.wikipediaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
              <details className="bg-white/50 border border-gray-300/60 p-2 rounded-md">
                <summary className="font-semibold cursor-pointer">Itinerari ({itineraries.length})</summary>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className={tableHeaderStyle}>Titolo</th>
                        <th className={tableHeaderStyle}>N° Tappe</th>
                        <th className={tableHeaderStyle}>Durata Stimata</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itineraries.map(it => (
                        <tr key={it.id}>
                          <td className={tableCellStyle}>{it.title}</td>
                          <td className={tableCellStyle}>{it.poiIds.length}</td>
                          <td className={tableCellStyle}>{it.estimatedDuration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
           </div>
        </div>
        
      </div>
    </div>
  );
};

export default ProfileView;