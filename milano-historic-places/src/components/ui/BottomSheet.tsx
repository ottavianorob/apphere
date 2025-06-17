// src/components/ui/BottomSheet.tsx
import React from 'react';
import type { Place } from '../types';

interface Props {
  place: Place;
  onClose: () => void;
}

export default function BottomSheet({ place, onClose }: Props) {
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
          <p className="text-sm font-medium text-indigo-600 mt-1">{place.category}</p>
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

      {/* Image */}
      {place.image && (
        <img
          src={place.image}
          alt={place.title}
          className="w-full h-48 object-cover"
        />
      )}

      {/* Teaser */}
      {place.teaser && (
        <div className="p-5 text-gray-800 space-y-4">
          <p className="text-base leading-relaxed">{place.teaser}</p>
        </div>
      )}

      {/* Actions */}
      <div className="px-5 py-4 border-t flex justify-end">
        <button
          onClick={() => window.open(place.image || '#', '_blank')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          Approfondisci
        </button>
      </div>
    </div>
  );
}
