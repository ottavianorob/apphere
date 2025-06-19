// src/components/ItineraryCard.tsx
import { motion } from 'framer-motion';
import CategoryIcon from './CategoryIcon';
import type { Place } from './types';

interface Itinerary {
  id: string;
  title: string;
  image?: string;
  stops: string[];
  category?: string;
}

interface Props {
  itinerary: Itinerary;
  placesMap: Record<string, Place>;
  idx: number;
  onStart: (itinerary: Itinerary, places: Place[]) => void;
  className?: string; // aggiunta
}

export default function ItineraryCard({ itinerary: it, placesMap, idx, onStart, className }: Props) {
  const cat = it.category || (placesMap[it.stops[0]]?.category ?? '');
  return (
    <div
      tabIndex={0}
      role="button"
      aria-label={`Itinerario: ${it.title}`}
      className={`bg-newspaper-bg dark:bg-gradient-to-br dark:from-[#18151a] dark:to-[#23202a] border border-neutral-light dark:border-accent-gold shadow rounded-xl overflow-hidden flex focus:ring-2 focus:ring-accent-bordeaux dark:focus:ring-accent-gold transition-all duration-200 hover:shadow-lg hover:border-accent-gold outline-none group w-full ${className || ''}`}
    >
      <motion.div
        key={it.id}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ delay: idx * 0.05, type: 'spring', stiffness: 200, damping: 24 }}
        whileHover={{ scale: 1.025 }}
        whileTap={{ scale: 0.98 }}
      >
        {it.image ? (
          <img src={it.image} alt={it.title} className="w-24 h-24 object-cover rounded-xl border border-neutral-light" loading="lazy" />
        ) : (
          <div className="w-24 h-24 bg-neutral-light flex items-center justify-center flex-shrink-0">
            <span className="text-xs text-text-secondary">{it.stops.length} tappe</span>
          </div>
        )}
        <div className="p-4 flex-1">
          <div className="flex items-center space-x-2">
            {cat && <CategoryIcon category={cat} className="w-5 h-5" ariaLabel={cat} />}
            <h3 className="text-lg font-heading text-text-primary dark:text-accent-gold group-hover:text-accent-bordeaux dark:group-hover:text-accent-gold transition-colors">{it.title}</h3>
          </div>
          <div className="mt-2 space-y-1 text-sm text-text-secondary dark:text-accent-gold">
            {it.stops.slice(0, 3).map(stopId => {
              if (!placesMap[stopId])
                return <div key={stopId} className="text-red-500">Tappa non trovata: {stopId}</div>;
              return <div key={stopId}>{placesMap[stopId]?.title || stopId}</div>;
            })}
            {it.stops.length > 3 && <div>…</div>}
          </div>
          <button
            onClick={() => onStart(it, it.stops.map(id => placesMap[id]).filter(Boolean) as Place[])}
            className="mt-3 inline-block bg-accent-bordeaux text-white px-4 py-2 rounded-full hover:bg-accent-gold hover:text-accent-bordeaux transition focus:outline-none focus:ring-2 focus:ring-accent-bordeaux focus:ring-offset-2"
            aria-label={`Avvia tour: ${it.title}`}
          >
            Avvia tour
          </button>
        </div>
      </motion.div>
    </div>
  );
}
