// src/components/ui/BottomSheet.tsx
import React from 'react';
import type { Place } from '../types';

interface Props {
  place: Place;
  photos?: { id: string; url: string; caption: string }[];
  characters?: { id: string; name: string; image: string }[];
  onClose: () => void;
}

export default function BottomSheet({ place, photos = [], characters = [], onClose }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 max-h-[90%] bg-white rounded-t-2xl shadow-2xl overflow-y-auto">
      {/* Drag handle */}
      <div className="w-12 h-1.5 bg-gray-300 mx-auto mt-2 rounded-full" />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{place.title}</h2>
          <p className="text-sm font-medium text-indigo-600 mt-1">
            {place.category}
          </p>
          {place.tags && (
            <div className="flex flex-wrap gap-2 mt-2">
              {place.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs uppercase bg-gray-100 text-gray-700 px-2 py-1 rounded-full" 
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Chiudi"
          className="text-gray-500 hover:text-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {place.date && (
        <p className="px-5 text-sm text-gray-500">{new Date(place.date).toLocaleDateString()}</p>
      )}

      {photos.length > 0 && (
        <div className="py-4">
          <div className="flex overflow-x-auto space-x-2 px-5">
            {photos.map(photo => (
              <img
                key={photo.id}
                src={photo.url}
                alt={photo.caption}
                className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {/* Teaser */}
      {place.teaser && (
        <div className="p-5 text-gray-800 space-y-4">
          <p className="text-base leading-relaxed">{place.teaser}</p>
        </div>
      )}

      {characters.length > 0 && (
        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Personaggi</h3>
          <div className="flex flex-wrap gap-3">
            {characters.map(char => (
              <div key={char.id} className="flex items-center space-x-2">
                <img src={char.image} alt={char.name} className="w-8 h-8 rounded-full object-cover" />
                <span className="text-sm text-gray-800">{char.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-5 py-4 border-t flex justify-end">
        <button
          onClick={() => window.open(place.links?.fullInfo || '#', '_blank')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          Approfondisci
        </button>
      </div>
    </div>
  );
}
