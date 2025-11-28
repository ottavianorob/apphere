
import React, { useState, useEffect } from 'react';
import { Point } from '../types';
import { characters as allCharacters } from '../data/mockData';
import CloseIcon from './icons/CloseIcon';

interface PointDetailModalProps {
  point: Point;
  onClose: () => void;
}

const PointDetailModal: React.FC<PointDetailModalProps> = ({ point, onClose }) => {
  const linkedCharacters = allCharacters.filter(c => point.linkedCharacterIds.includes(c.id));

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
        <header className="p-6 border-b border-gray-300 flex justify-between items-center sticky top-0 bg-[#EDE5D0]">
          <h2 className="font-serif-display text-3xl font-bold text-[#134A79]">{point.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-[#1C1C1C]">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="overflow-y-auto p-6">
          <img src={point.photos[0].url} alt={point.photos[0].caption} className="w-full h-64 object-cover mb-4" />
          <p className="text-[#1C1C1C] mb-6 whitespace-pre-wrap leading-relaxed">{point.description}</p>
          
          {linkedCharacters.length > 0 && (
            <div className="mb-6">
              <h3 className="font-serif-display text-xl font-bold text-gray-800 mb-2">Personaggi Collegati</h3>
              <div className="flex flex-wrap gap-2">
                {linkedCharacters.map(char => (
                  <a 
                    key={char.id} 
                    href={char.wikipediaUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-200 text-[#134A79] px-3 py-1 text-sm hover:bg-gray-300 transition-colors"
                  >
                    {char.name}
                  </a>
                ))}
              </div>
            </div>
          )}
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