import React from 'react';
import PlusIcon from './icons/PlusIcon';
import { Poi, Character, Itinerary, Category, Period } from '../types';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';

interface ProfileViewProps {
  onAddPoiClick: () => void;
  onAddCharacterClick: () => void;
  onAddItineraryClick: () => void;
  onAddCategoryClick: () => void;
  onAddPeriodClick: () => void;
  onDelete: (table: string, id: string, name: string) => void;
  onModify: (type: string, data: any) => void;
  pois: Poi[];
  characters: Character[];
  itineraries: Itinerary[];
  categories: Category[];
  periods: Period[];
}

const ProfileView: React.FC<ProfileViewProps> = ({ 
  onAddPoiClick, 
  onAddCharacterClick, 
  onAddItineraryClick,
  onAddCategoryClick,
  onAddPeriodClick,
  onDelete,
  onModify,
  pois,
  characters,
  itineraries,
  categories,
  periods
}) => {
  const tableHeaderStyle = "p-2 font-semibold text-left border-b-2 border-gray-300";
  const tableCellStyle = "p-2 border-b border-gray-200";
  const actionButtonStyle = "p-1 text-gray-500 hover:text-gray-800 transition-colors";

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <button onClick={onAddCategoryClick} className="w-full text-left flex items-center gap-3 p-3 rounded-md bg-white hover:bg-gray-100 transition-colors border border-gray-300">
              <PlusIcon className="w-5 h-5 flex-shrink-0 text-[#134A79]" />
              <span className="font-sans-display font-semibold text-gray-800">Aggiungi una nuova Categoria</span>
            </button>
            <button onClick={onAddPeriodClick} className="w-full text-left flex items-center gap-3 p-3 rounded-md bg-white hover:bg-gray-100 transition-colors border border-gray-300">
              <PlusIcon className="w-5 h-5 flex-shrink-0 text-[#134A79]" />
              <span className="font-sans-display font-semibold text-gray-800">Aggiungi un nuovo Periodo</span>
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
                        <th className={tableHeaderStyle}>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pois.map(poi => (
                        <tr key={poi.id}>
                          <td className={tableCellStyle}>{poi.title}</td>
                          <td className={tableCellStyle}>{poi.type}</td>
                          <td className={tableCellStyle}>{poi.author}</td>
                          <td className={tableCellStyle}>
                            <div className="flex gap-2">
                                <button onClick={() => onModify('poi', poi)} className={actionButtonStyle} title="Modifica"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => onDelete('pois', poi.id, poi.title)} className={actionButtonStyle} title="Elimina"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                          </td>
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
                        <th className={tableHeaderStyle}>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {characters.map(char => (
                        <tr key={char.id}>
                          <td className={tableCellStyle}>{char.name}</td>
                          <td className={tableCellStyle}>{char.description.substring(0, 50)}...</td>
                          <td className={tableCellStyle}>
                            <div className="flex gap-2">
                                <button onClick={() => onModify('character', char)} className={actionButtonStyle} title="Modifica"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => onDelete('characters', char.id, char.name)} className={actionButtonStyle} title="Elimina"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                          </td>
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
                        <th className={tableHeaderStyle}>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itineraries.map(it => (
                        <tr key={it.id}>
                          <td className={tableCellStyle}>{it.title}</td>
                          <td className={tableCellStyle}>{it.poiIds.length}</td>
                          <td className={tableCellStyle}>
                            <div className="flex gap-2">
                                <button onClick={() => onModify('itinerary', it)} className={actionButtonStyle} title="Modifica"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => onDelete('itineraries', it.id, it.title)} className={actionButtonStyle} title="Elimina"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
               <details className="bg-white/50 border border-gray-300/60 p-2 rounded-md">
                <summary className="font-semibold cursor-pointer">Categorie ({categories.length})</summary>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className={tableHeaderStyle}>Nome</th>
                        <th className={tableHeaderStyle}>ID</th>
                        <th className={tableHeaderStyle}>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(cat => (
                        <tr key={cat.id}>
                          <td className={tableCellStyle}>{cat.name}</td>
                          <td className={tableCellStyle}>{cat.id}</td>
                          <td className={tableCellStyle}>
                            <div className="flex gap-2">
                                <button onClick={() => onModify('category', cat)} className={actionButtonStyle} title="Modifica"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => onDelete('categories', cat.id, cat.name)} className={actionButtonStyle} title="Elimina"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
              <details className="bg-white/50 border border-gray-300/60 p-2 rounded-md">
                <summary className="font-semibold cursor-pointer">Periodi Storici ({periods.length})</summary>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className={tableHeaderStyle}>Nome</th>
                        <th className={tableHeaderStyle}>Inizio</th>
                        <th className={tableHeaderStyle}>Fine</th>
                        <th className={tableHeaderStyle}>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {periods.map(p => (
                        <tr key={p.id}>
                          <td className={tableCellStyle}>{p.name}</td>
                          <td className={tableCellStyle}>{p.start_year}</td>
                          <td className={tableCellStyle}>{p.end_year}</td>
                          <td className={tableCellStyle}>
                            <div className="flex gap-2">
                                <button onClick={() => onModify('period', p)} className={actionButtonStyle} title="Modifica"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => onDelete('periods', p.id, p.name)} className={actionButtonStyle} title="Elimina"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                          </td>
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