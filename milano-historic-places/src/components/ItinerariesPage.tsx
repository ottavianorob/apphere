// src/components/ItinerariesPage.tsx
import { AnimatePresence } from 'framer-motion';
import type { Place } from './types';
import ItineraryCard from './ItineraryCard';

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
      <div className="p-4 bg-[#fdf6e3] text-[#333]">
        <p className="text-center text-text-secondary font-sans">Nessun itinerario disponibile.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 bg-[#fdf6e3] text-[#333]">
      <AnimatePresence>
        {itineraries.map((it, idx) => (
          <ItineraryCard
            key={it.id}
            itinerary={it}
            placesMap={placesMap}
            idx={idx}
            onStart={onStart}
            className="bg-white shadow-md rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
          />
        ))}
      </AnimatePresence>
    </div>
  );
}