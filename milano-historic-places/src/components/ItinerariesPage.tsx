// src/components/ItinerariesPage.tsx
import React, { useEffect, useState } from 'react';
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

type Props = {
  onStart: (itinerary: Itinerary, places: Place[]) => void;
};

export default function ItinerariesPage({ onStart }: Props) {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [placesMap, setPlacesMap] = useState<Record<string, Place>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carica itineraries.json e places.json insieme
  useEffect(() => {
    Promise.all([
      fetch(import.meta.env.BASE_URL + 'itineraries.json').then(r => {
        if (!r.ok) throw new Error('itineraries.json fetch failed: ' + r.status);
        return r.json();
      }),
      fetch(import.meta.env.BASE_URL + 'places.json').then(r => {
        if (!r.ok) throw new Error('places.json fetch failed: ' + r.status);
        return r.json();
      }),
    ]).then(([rawIt, rawPlaces]: [Record<string, any>, Place[]]) => {
      console.log('Loaded itineraries keys:', Object.keys(rawIt));
      console.log('Loaded places count:', rawPlaces.length);
      const list: Itinerary[] = Object.entries(rawIt).map(([id, it]) => ({ id, ...it }));
      setItineraries(list);
      const map: Record<string, Place> = {};
      rawPlaces.forEach(p => (map[p.id] = p));
      setPlacesMap(map);
      setLoading(false);
    }).catch(err => {
      console.error('Error loading data:', err);
      setError('Errore caricamento itinerari o luoghi');
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-4 space-y-4">
      {loading && !error && (
        <p className="text-center text-text-secondary">Caricamento itinerari...</p>
      )}
      {error && <p className="text-accent-bordeaux text-center">{error}</p>}
      {!loading && !error && itineraries.length === 0 && (
        <p className="text-center text-text-secondary">Nessun itinerario disponibile.</p>
      )}
      {!loading && itineraries.map(it => (
        <div
          key={it.id}
          className="bg-newspaper-bg border border-neutral-light shadow rounded-lg overflow-hidden flex"
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
              className="mt-3 inline-block bg-accent-bordeaux text-white px-4 py-2 rounded-lg hover:bg-accent-gold hover:text-accent-bordeaux transition"
            >
              Avvia tour
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}