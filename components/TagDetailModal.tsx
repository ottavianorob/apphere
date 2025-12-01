import React, { useMemo } from 'react';
import { Poi, Itinerary, Character, Category } from '../types';
import CloseIcon from './icons/CloseIcon';
import TagIcon from './icons/TagIcon';
import PoiListItem from './PoiListItem';
import RouteIcon from './icons/RouteIcon';
import UsersIcon from './icons/UsersIcon';

interface TagDetailModalProps {
  tag: string;
  allPois: Poi[];
  allItineraries: Itinerary[];
  allCharacters: Character[];
  categories: Category[];
  onClose: () => void;
  onSelectPoi: (poi: Poi) => void;
  onSelectItinerary: (itineraryId: string) => void;
  onSelectCharacter: (characterId: string) => void;
}

const TagDetailModal: React.FC<TagDetailModalProps> = ({
  tag,
  allPois,
  allItineraries,
  allCharacters,
  categories,
  onClose,
  onSelectPoi,
  onSelectItinerary,
  onSelectCharacter,
}) => {
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);

  const linkedPois = useMemo(() =>
    allPois.filter(p => p.tags?.includes(tag)),
    [tag, allPois]
  );

  const linkedItineraries = useMemo(() =>
    allItineraries.filter(i => i.tags?.includes(tag)),
    [tag, allItineraries]
  );
  
  const linkedCharacters = useMemo(() => {
    const characterIds = new Set<string>();
    linkedPois.forEach(poi => {
      poi.linkedCharacterIds.forEach(id => characterIds.add(id));
    });
    return allCharacters.filter(c => characterIds.has(c.id));
  }, [linkedPois, allCharacters]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-[#FAF7F0] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up border border-black/10" onClick={e => e.stopPropagation()}>
        <header className="p-6 flex items-start justify-between border-b border-gray-300/80">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                <TagIcon className="w-8 h-8 text-gray-600"/>
            </div>
            <div>
              <h2 className="font-sans-display text-4xl font-bold text-[#134A79]">#{tag}</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon className="w-6 h-6" /></button>
        </header>

        <div className="overflow-y-auto p-6 space-y-8">
          {linkedPois.length > 0 && (
            <div>
              <h3 className="font-serif-display text-xl italic text-gray-800 mb-3 border-b border-gray-300 pb-1">Luoghi Correlati</h3>
              <div className="mt-4">
                {linkedPois.map(poi => (
                  <PoiListItem
                    key={poi.id}
                    poi={poi}
                    onSelect={() => onSelectPoi(poi)}
                    categoryName={categoryMap.get(poi.categoryId)}
                  />
                ))}
              </div>
            </div>
          )}

          {linkedItineraries.length > 0 && (
            <div>
              <h3 className="font-serif-display text-xl italic text-gray-800 mb-3 border-b border-gray-300 pb-1">Itinerari Correlati</h3>
              <div className="space-y-2 mt-4">
                {linkedItineraries.map(itinerary => (
                  <button key={itinerary.id} onClick={() => onSelectItinerary(itinerary.id)} className="w-full text-left flex items-center gap-3 p-2 rounded-md hover:bg-[#134A79]/10 transition-colors">
                    <RouteIcon className="w-5 h-5 flex-shrink-0 text-gray-600" />
                    <p className="font-sans-display font-semibold text-gray-800">{itinerary.title}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {linkedCharacters.length > 0 && (
            <div>
              <h3 className="font-serif-display text-xl italic text-gray-800 mb-3 border-b border-gray-300 pb-1">Personaggi Correlati</h3>
              <div className="space-y-2 mt-4">
                {linkedCharacters.map(character => (
                  <button key={character.id} onClick={() => onSelectCharacter(character.id)} className="w-full text-left flex items-center gap-3 p-2 rounded-md hover:bg-[#134A79]/10 transition-colors">
                     {character.photos.length > 0 ? (
                        <img src={character.photos[0].url} alt={character.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <UsersIcon className="w-5 h-5 text-gray-500"/>
                        </div>
                    )}
                    <p className="font-sans-display font-semibold text-gray-800">{character.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          
           {linkedPois.length === 0 && linkedItineraries.length === 0 && linkedCharacters.length === 0 && (
              <p className="text-center text-gray-600 font-sans-display">Nessun contenuto trovato per questo tag.</p>
           )}

        </div>
      </div>
      <style>{`@keyframes fade-in{from{opacity:0}to{opacity:1}}.animate-fade-in{animation:fade-in .3s ease-out forwards}@keyframes slide-up{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}.animate-slide-up{animation:slide-up .3s ease-out forwards}`}</style>
    </div>
  );
};

export default TagDetailModal;
