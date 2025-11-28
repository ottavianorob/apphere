import React, { useState, useEffect } from 'react';
import { Point } from '../types';
import { characters as allCharacters } from '../data/mockData';
import CloseIcon from './icons/CloseIcon';
import NavigationIcon from './icons/NavigationIcon';

interface PointDetailModalProps {
  point: Point;
  onClose: () => void;
}

const PointDetailModal: React.FC<PointDetailModalProps> = ({ point, onClose }) => {
  const linkedCharacters = allCharacters.filter(c => point.linkedCharacterIds.includes(c.id));
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${point.coordinates.latitude},${point.coordinates.longitude}`;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#EDE5D0] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up border border-black/10"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-6 border-b border-gray-300 flex justify-between items-start sticky top-0 bg-[#EDE5D0]">
          <div>
            <h2 className="font-sans-display text-3xl font-bold text-[#134A79]">{point.title}</h2>
            <p className="font-serif-display italic text-lg text-gray-600 mt-1">{point.location}, {point.eventDate}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-[#1C1C1C] flex-shrink-0 ml-4">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="overflow-y-auto p-6">
          <img src={point.photos[0].url} alt={point.photos[0].caption} className="w-full h-64 object-cover mb-4" />
          <p className="italic text-[#1C1C1C] mb-6 whitespace-pre-wrap leading-relaxed text-lg">{point.description}</p>
          
          <div className="mb-8">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-[#134A79] text-white font-sans-display font-bold rounded-lg shadow-md hover:bg-[#103a60] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#EDE5D0] focus:ring-[#134A79] transition-all duration-200"
            >
              <NavigationIcon className="w-5 h-5 mr-2" />
              <span>Portami qui</span>
            </a>
          </div>

          <div className="space-y-6">
            {linkedCharacters.length > 0 && (
              <div>
                <h3 className="font-serif-display text-xl italic text-gray-800 mb-3 border-b border-gray-300 pb-1">Personaggi Collegati</h3>
                <div className="space-y-3">
                  {linkedCharacters.map(char => (
                    <a 
                      key={char.id} 
                      href={char.wikipediaUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center p-2 rounded-lg hover:bg-[#134A79]/10 transition-colors"
                    >
                      {char.profileImageUrl && (
                        <img 
                          src={char.profileImageUrl} 
                          alt={char.name} 
                          className="w-10 h-10 rounded-full object-cover mr-4 border-2 border-white/50"
                        />
                      )}
                      <span className="font-sans-display text-[#134A79] text-base font-semibold">{char.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {point.tags && point.tags.length > 0 && (
              <div>
                <h3 className="font-serif-display text-xl italic text-gray-800 mb-3 border-b border-gray-300 pb-1">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {point.tags.map(tag => (
                    <span key={tag} className="bg-gray-500/10 text-gray-600 px-3 py-1 text-sm font-sans-display font-semibold">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PointDetailModal;