import React, { useMemo } from 'react';
import { Character, Poi } from '../types';
import CloseIcon from './icons/CloseIcon';
import MapPinIcon from './icons/MapPinIcon';
import UsersIcon from './icons/UsersIcon';

interface CharacterDetailModalProps {
  character: Character;
  allPois: Poi[];
  onClose: () => void;
  onSelectPoi: (poi: Poi) => void;
}

const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({ character, allPois, onClose, onSelectPoi }) => {
  const linkedPois = useMemo(() => 
    allPois.filter(p => p.linkedCharacterIds.includes(character.id)),
    [character, allPois]
  );

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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-[#FAF7F0] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up border border-black/10" onClick={e => e.stopPropagation()}>
        <header className="p-6 flex items-start justify-between border-b border-gray-300/80">
          <div className="flex items-center gap-4">
            {character.profileImageUrl ? (
              <img src={character.profileImageUrl} alt={character.name} className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md" />
            ) : (
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                    <UsersIcon className="w-10 h-10 text-gray-500"/>
                </div>
            )}
            <div>
              <h2 className="font-sans-display text-3xl font-bold text-[#134A79]">{character.name}</h2>
              <p className="font-serif-display italic text-gray-600">{character.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon className="w-6 h-6" /></button>
        </header>

        <div className="overflow-y-auto p-6 space-y-6">
          <p className="text-lg text-gray-800 leading-relaxed font-serif-display">
            Per saperne di più, consulta la pagina <a href={character.wikipediaUrl} target="_blank" rel="noopener noreferrer" className="text-[#134A79] font-bold hover:underline">Wikipedia</a>.
          </p>

          {linkedPois.length > 0 && (
            <div>
              <h3 className="font-serif-display text-xl italic text-gray-800 mb-3 border-b border-gray-300 pb-1">Luoghi Collegati</h3>
              <div className="space-y-2 mt-4">
                {linkedPois.map(poi => (
                  <button key={poi.id} onClick={() => handlePoiClick(poi)} className="w-full text-left flex items-center gap-3 p-2 rounded-md hover:bg-[#134A79]/10 transition-colors">
                    <MapPinIcon className="w-5 h-5 flex-shrink-0 text-[#B1352E]" />
                    <div>
                      <p className="font-sans-display font-semibold text-gray-800">{poi.title}</p>
                      <p className="font-sans-display text-sm text-gray-600">{poi.location}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {characterTags.length > 0 && (
            <div>
              <h3 className="font-serif-display text-xl italic text-gray-800 mb-3 border-b border-gray-300 pb-1">Tags Correlati</h3>
              <div className="flex flex-wrap gap-2 mt-4">
                {characterTags.map(tag => (
                  <span key={tag} className="bg-gray-500/10 text-gray-600 px-3 py-1 text-sm font-sans-display font-semibold">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes fade-in{from{opacity:0}to{opacity:1}}.animate-fade-in{animation:fade-in .3s ease-out forwards}@keyframes slide-up{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}.animate-slide-up{animation:slide-up .3s ease-out forwards}`}</style>
    </div>
  );
};

export default CharacterDetailModal;
