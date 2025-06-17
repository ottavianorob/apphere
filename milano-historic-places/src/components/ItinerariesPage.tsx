// src/components/ItinerariesPage.tsx
import React, { useEffect, useState } from 'react';
import type { Place } from './types';

// Definizione locale di Itinerary
interface Itinerary {
  id: string;
  title: string;
  stops: string[];
}

type Props = {
  onStart: (itinerary: Itinerary, places: Place[]) => void;
};

export default function ItinerariesPage({ onStart }: Props) {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [placesMap, setPlacesMap] = useState<Record<string, Place>>({});

  // Carica itineraries.json e places.json insieme
  useEffect(() => {
    Promise.all([
      fetch(import.meta.env.BASE_URL + 'itineraries.json').then(r => r.json()),
      fetch(import.meta.env.BASE_URL + 'places.json').then(r => r.json()),
    ]).then(([rawIt, rawPlaces]: [Record<string, any>, Place[]]) => {
      const list: Itinerary[] = Object.entries(rawIt).map(([id, it]) => ({ id, ...it }));
      setItineraries(list);
      const map: Record<string, Place> = {};
      rawPlaces.forEach(p => (map[p.id] = p));
      setPlacesMap(map);
    }).catch(err => console.error('Error loading data:', err));
  }, []);

  return (
    <div className="p-4 space-y-4">
      {itineraries.map(it => (
        <div
          key={it.id}
          className="bg-white shadow rounded-lg overflow-hidden flex"
        >
          <div className="w-24 h-24 bg-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-500">{it.stops.length} tappe</span>
          </div>
          <div className="p-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-800">{it.title}</h3>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              {it.stops.slice(0, 3).map(stopId => (
                <div key={stopId}>{placesMap[stopId]?.title || stopId}</div>
              ))}
              {it.stops.length > 3 && <div>…</div>}
            </div>
            <button
              onClick={() => onStart(it, it.stops.map(id => placesMap[id]).filter(Boolean) as Place[])}
              className="mt-3 inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Avvia tour
            </button>
          </div>
        </div>
      ))}
      {itineraries.length === 0 && (
        <p className="text-center text-gray-500">Nessun itinerario disponibile.</p>
      )}
    </div>
  );
}