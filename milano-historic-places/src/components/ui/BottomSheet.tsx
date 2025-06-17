// src/components/ui/BottomSheet.tsx
import React from 'react';
import type { Place } from '../types';

type Props = {
  place: Place;
  onClose: () => void;
};

export default function BottomSheet({ place, onClose }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-lg max-h-[90%] overflow-auto">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">{place.title}</h2>
          <p className="text-sm font-semibold text-gray-600">{place.category}</p>
          {place.tags && place.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {place.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs uppercase bg-gray-200 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Chiudi dettagli"
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {place.image && (
        <img
          src={place.image}
          alt={place.title}
          className="w-full h-48 object-cover"
        />
      )}

      {place.teaser && (
        <p className="p-4 text-gray-800">{place.teaser}</p>
      )}

      {/* Qui puoi aggiungere altri dettagli: approfondimenti, link, etc. */}
    </div>
  );
}