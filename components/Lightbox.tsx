import React, { useState, useEffect } from 'react';
import { Photo } from '../types';
import CloseIcon from './icons/CloseIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ photos, currentIndex, onClose }) => {
  const [index, setIndex] = useState(currentIndex);

  const handleNext = () => {
    setIndex(prev => (prev + 1) % photos.length);
  };

  const handlePrev = () => {
    setIndex(prev => (prev - 1 + photos.length) % photos.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photos.length]);

  const currentPhoto = photos[index];

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/30 rounded-full p-2 hover:bg-black/50 transition-colors z-20">
        <CloseIcon className="w-6 h-6" />
      </button>

      <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
        {photos.length > 1 && (
            <button 
                onClick={handlePrev} 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 rounded-full p-2 hover:bg-black/50 transition-colors z-20"
                aria-label="Immagine precedente"
            >
                <ChevronLeftIcon className="w-8 h-8" />
            </button>
        )}

        <div className="flex flex-col items-center justify-center max-w-full max-h-full">
            <img 
                src={currentPhoto.url} 
                alt={currentPhoto.caption}
                className="max-w-full max-h-[85vh] object-contain block"
            />
             {currentPhoto.caption && (
                <p className="text-white text-center mt-4 font-sans-display drop-shadow-md bg-black/30 px-3 py-1 rounded-md">{currentPhoto.caption}</p>
            )}
        </div>


        {photos.length > 1 && (
            <button 
                onClick={handleNext} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 rounded-full p-2 hover:bg-black/50 transition-colors z-20"
                aria-label="Immagine successiva"
            >
                <ChevronRightIcon className="w-8 h-8" />
            </button>
        )}

        {photos.length > 1 && (
            <div className="absolute bottom-4 bg-black/50 text-white text-sm font-sans-display font-semibold px-3 py-1 rounded-full">
                {index + 1} / {photos.length}
            </div>
        )}
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Lightbox;
