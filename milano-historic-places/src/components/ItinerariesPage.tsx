// src/components/ItinerariesPage.tsx
import React from 'react';
import type { Place } from './types';
import CategoryIcon from '../components/CategoryIcon';

// Definizione locale di Itinerary
interface Itinerary {
  id: string;
  title: string;
  image?: string;
  stops: string[];
  category?: string;
}

interface Props {
  itineraries: Itinerary[];
  places: Place[];
  onStart: (itinerary: Itinerary, places: Place[]) => void;
}

export default function ItinerariesPage({ itineraries, places, onStart }: Props) {
  // Mappa id->Place per lookup veloce
  const placesMap: Record<string, Place> = {};
  places.forEach(p => (placesMap[p.id] = p));

  if (!itineraries || itineraries.length === 0) {
    return (
      <div className="p-4">
        <p className="text-center text-text-secondary">Nessun itinerario disponibile.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {itineraries.map(it => (
        <div
          key={it.id}
          className="bg-newspaper-bg border border-neutral-light shadow rounded overflow-hidden flex"
        >
          {it.image ? (
            <img src={it.image} alt={it.title} className="w-24 h-24 object-cover flex-shrink-0" />
          ) : (
            <div className="w-24 h-24 bg-neutral-light flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-text-secondary">{it.stops.length} tappe</span>
            </div>
          )}
          <div className="p-4 flex-1">
            {(() => {
              // Determina categoria: usa it.category se presente, altrimenti prima tappa se disponibile
              const cat = it.category || (placesMap[it.stops[0]]?.category ?? '');
              return (
                <div className="flex items-center space-x-2">
                  {cat && <CategoryIcon category={cat} className="w-5 h-5" ariaLabel={cat} />}
                  <h3 className="text-lg font-heading text-text-primary">{it.title}</h3>
                </div>
              );
            })()}
            <div className="mt-2 space-y-1 text-sm text-text-secondary">
              {it.stops.slice(0, 3).map(stopId => {
                if (!placesMap[stopId]) console.warn(`Itinerario ${it.id}: tappa non trovata: ${stopId}`);
                return <div key={stopId}>{placesMap[stopId]?.title || stopId}</div>;
              })}
              {it.stops.length > 3 && <div>…</div>}
            </div>
            <button
              onClick={() => onStart(it, it.stops.map(id => placesMap[id]).filter(Boolean) as Place[])}
              className="mt-3 inline-block bg-accent-bordeaux text-white px-4 py-2 rounded hover:bg-accent-gold hover:text-accent-bordeaux transition"
            >
              Avvia tour
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}