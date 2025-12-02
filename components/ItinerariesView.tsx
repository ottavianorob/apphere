import React from 'react';
import { Itinerary } from '../types';
import RouteIcon from './icons/RouteIcon';
import ClockIcon from './icons/ClockIcon';
import StarIcon from './icons/StarIcon';

interface ItinerariesViewProps {
  itineraries: Itinerary[];
  onSelectItinerary: (itinerary: Itinerary) => void;
}

const ItineraryListItem: React.FC<{ itinerary: Itinerary; onSelect: () => void; }> = ({ itinerary, onSelect }) => {
  return (
    <div
      className="border-b border-gray-300/80 group cursor-pointer flex flex-col sm:flex-row items-start gap-4 py-4"
      onClick={onSelect}
    >
      <img
        src={itinerary.coverPhoto.url}
        alt={itinerary.coverPhoto.caption}
        className="w-full sm:w-40 h-40 sm:h-28 rounded-md object-cover transition-all"
      />
      <div className="flex-grow">
        <h3 className="font-serif-display text-xl font-semibold text-[#134A79] group-hover:text-[#B1352E] transition-colors">{itinerary.title}</h3>
        <p className="font-sans-display text-sm text-gray-700 mt-1 line-clamp-2">{itinerary.description}</p>
        <div className="mt-2 flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 font-sans-display">
            <div className="flex items-center gap-1.5" title="Numero di tappe">
              <RouteIcon className="w-4 h-4 flex-shrink-0 text-gray-500" />
              <span>{itinerary.poiIds.length} tappe</span>
            </div>
            <div className="flex items-center gap-1.5" title="Durata stimata">
                <ClockIcon className="w-4 h-4 flex-shrink-0 text-gray-500" />
                <span>{itinerary.estimatedDuration}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Numero di preferiti">
                <StarIcon isFilled={itinerary.isFavorited} className={`w-4 h-4 flex-shrink-0 ${itinerary.isFavorited ? 'text-yellow-500' : 'text-gray-500'}`} />
                <span className="font-semibold">{itinerary.favoriteCount}</span>
            </div>
        </div>
      </div>
    </div>
  );
};


const ItinerariesView: React.FC<ItinerariesViewProps> = ({ itineraries, onSelectItinerary }) => {
  return (
    <div>
      <header className="mb-8 border-b-2 border-[#2D3748] pb-4 text-center">
        <h1 className="font-sans-display text-4xl sm:text-5xl font-bold text-[#2D3748] tracking-tighter">Itinerari Tematici</h1>
        <p className="font-serif-display italic text-lg text-gray-700 mt-2">Scopri la storia attraverso percorsi guidati</p>
      </header>
      
      <div>
        {itineraries.length > 0 ? (
          itineraries.map(itinerary => (
            <ItineraryListItem 
              key={itinerary.id} 
              itinerary={itinerary}
              onSelect={() => onSelectItinerary(itinerary)}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-600 font-sans-display">
            <p className="font-semibold">Nessun itinerario disponibile.</p>
            <p className="text-sm">Torna a trovarci presto per nuovi contenuti.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItinerariesView;