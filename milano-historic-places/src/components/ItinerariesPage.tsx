// src/components/ItinerariesPage.tsx
import { motion, AnimatePresence } from 'framer-motion';
import type { Place } from './types';
import CategoryIcon from '../components/CategoryIcon';
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
      <div className="p-4">
        <p className="text-center text-text-secondary">Nessun itinerario disponibile.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <AnimatePresence>
      {itineraries.map((it, idx) => (
        <ItineraryCard
          key={it.id}
          itinerary={it}
          placesMap={placesMap}
          idx={idx}
          onStart={onStart}
        />
      ))}
      </AnimatePresence>
    </div>
  );
}