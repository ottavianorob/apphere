
import React, { useState, useEffect } from 'react';
import { Point, Character } from '../types';
import { characters as allCharacters } from '../data/mockData';
import CloseIcon from './icons/CloseIcon';
import SparklesIcon from './icons/SparklesIcon';
import { getGenerativeContent } from '../services/geminiService';

interface PointDetailModalProps {
  point: Point;
  onClose: () => void;
}

const PointDetailModal: React.FC<PointDetailModalProps> = ({ point, onClose }) => {
  const [geminiContent, setGeminiContent] = useState<string>('');
  const [isLoadingGemini, setIsLoadingGemini] = useState<boolean>(false);
  const [showGemini, setShowGemini] = useState<boolean>(false);

  const linkedCharacters = allCharacters.filter(c => point.linkedCharacterIds.includes(c.id));

  const handleGenerateContent = async () => {
    setIsLoadingGemini(true);
    setShowGemini(true);
    const content = await getGenerativeContent(point);
    setGeminiContent(content);
    setIsLoadingGemini(false);
  };

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

          <div className="border-t border-gray-300 pt-6">
            <button
              onClick={handleGenerateContent}
              disabled={isLoadingGemini}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#134A79] text-white font-bold rounded-md hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SparklesIcon className="w-5 h-5" />
              {isLoadingGemini ? 'Sto pensando...' : 'Chiedi di più a Gemini'}
            </button>

            {showGemini && (
              <div className="mt-4 p-4 bg-black/5 rounded-lg animate-fade-in">
                {isLoadingGemini ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#134A79]"></div>
                  </div>
                ) : (
                  <p className="text-[#1C1C1C] whitespace-pre-wrap leading-relaxed">{geminiContent}</p>
                )}
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
