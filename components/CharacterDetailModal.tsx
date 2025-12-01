import React, { useMemo, useState } from 'react';
import { Character, Poi, Category } from '../types';
import CloseIcon from './icons/CloseIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import PoiListItem from './PoiListItem';

interface CharacterDetailModalProps {
  character: Character;
  allPois: Poi[];
  categories: Category[];
  onClose: () => void;
  onSelectPoi: (poi: Poi) => void;
  onSelectTag: (tag: string) => void;
}

const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({ character, allPois, categories, onClose, onSelectPoi, onSelectTag }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const linkedPois = useMemo(() => 
    allPois.filter(p => p.linkedCharacterIds.includes(character.id)),
    [character, allPois]
  );
  
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);

  const characterTags = useMemo(() => {
    const tagCounts: { [key: string]: number } = {};
    linkedPois.forEach(poi => {
      poi.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).map(entry => entry[0]);
  }, [linkedPois]);

  const handlePoiClick = (poi: Poi) => {
    onClose(); 
    setTimeout(() => onSelectPoi(poi), 300); // Delay to allow modal to close
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => Math.min(prev + 1, character.photos.length - 1));
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-[#FAF7F0] w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up border border-black/10 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-800 bg-white/60 rounded-full p-1.5 hover:bg-white/90 backdrop-blur-sm transition-colors z-30"><CloseIcon className="w-5 h-5" /></button>
        <div className="overflow-y-auto">
          <div className="p-6">
            <div className="relative flex-shrink-0 group">
              {character.photos.length > 0 ? (
                <img src={character.photos[currentImageIndex].url} alt={character.photos[currentImageIndex].caption} className="w-full h-64 object-cover" />
              ) : (
                <div className="w-full h-64 bg-gray-300 flex items-center justify-center">
                  <span className="font-serif-display text-gray-500">Nessuna immagine</span>
                </div>
              )}
              {character.photos.length > 1 && (
                <>
                  <button onClick={handlePrevImage} disabled={currentImageIndex === 0} className="absolute top-1/2 left-2 -translate-y-1/2 text-white bg-black/40 rounded-full p-1.5 hover:bg-black/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10 opacity-0 group-hover:opacity-100" aria-label="Immagine precedente"><ChevronLeftIcon className="w-6 h-6" /></button>
                  <button onClick={handleNextImage} disabled={currentImageIndex === character.photos.length - 1} className="absolute top-1/2 right-2 -translate-y-1/2 text-white bg-black/40 rounded-full p-1.5 hover:bg-black/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10 opacity-0 group-hover:opacity-100" aria-label="Immagine successiva"><ChevronRightIcon className="w-6 h-6" /></button>
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs font-sans-display font-semibold px-2 py-1 rounded-full z-10">{currentImageIndex + 1} / {character.photos.length}</div>
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>
          </div>

          <div className="space-y-6 px-6 pb-6">
              <h2 className="font-sans-display text-3xl font-bold text-[#134A79]">{character.name}</h2>
              <p className="italic text-[#2D3748] whitespace-pre-wrap leading-relaxed text-lg">{character.description}</p>
              <p className="text-md text-gray-800 leading-relaxed font-sans-display">
                  Per saperne di più, consulta la pagina <a href={character.wikipediaUrl} target="_blank" rel="noopener noreferrer" className="text-[#134A79] font-bold hover:underline">Wikipedia</a>.
              </p>

              {linkedPois.length > 0 && (
                  <div>
                  <h3 className="font-serif-display text-xl italic text-gray-800 mb-3 border-b border-gray-300 pb-1">Luoghi Collegati</h3>
                  <div className="mt-4">
                      {linkedPois.map(poi => (
                      <PoiListItem 
                          key={poi.id} 
                          poi={poi}
                          onSelect={() => handlePoiClick(poi)}
                          categoryName={categoryMap.get(poi.categoryId)}
                      />
                      ))}
                  </div>
                  </div>
              )}

              {characterTags.length > 0 && (
                  <div>
                  <h3 className="font-serif-display text-xl italic text-gray-800 mb-3 border-b border-gray-300 pb-1">Tags Correlati</h3>
                  <div className="flex flex-wrap gap-2 mt-4">
                      {characterTags.map(tag => (
                      <button key={tag} onClick={() => onSelectTag(tag)} className="bg-gray-500/10 text-gray-600 px-3 py-1 text-sm font-sans-display font-semibold hover:bg-gray-500/20 transition-colors">
                          #{tag.toUpperCase().replace(/\s+/g, '')}
                      </button>
                      ))}
                  </div>
                  </div>
              )}
          </div>
        </div>
      </div>
      <style>{`@keyframes fade-in{from{opacity:0}to{opacity:1}}.animate-fade-in{animation:fade-in .3s ease-out forwards}@keyframes slide-up{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}.animate-slide-up{animation:slide-up .3s ease-out forwards}`}</style>
    </div>
  );
};

export default CharacterDetailModal;