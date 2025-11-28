import React, { useMemo } from 'react';
import { Itinerary, Point } from '../types';
import { points as allPoints } from '../data/mockData';
import RouteIcon from './icons/RouteIcon';

interface ItinerariesViewProps {
  itineraries: Itinerary[];
  onSelectPoint: (point: Point) => void;
}

const ItineraryCard: React.FC<{ itinerary: Itinerary, points: Point[], onSelectPoint: (point: Point) => void }> = ({ itinerary, points, onSelectPoint }) => {
  return (
    <div className="border-b border-gray-300/80 py-8 mb-8">
      <h2 className="font-serif-display text-3xl italic text-[#134A79] mb-2">{itinerary.title}</h2>
      <p className="italic text-gray-700 mb-4 max-w-prose">{itinerary.description}</p>
      <div className="font-sans-display flex items-center text-sm text-gray-500 mb-6">
        <RouteIcon className="w-4 h-4 mr-2" />
        <span>Durata Stimata: {itinerary.estimatedDuration}</span>
      </div>

      <div>
        <h3 className="font-serif-display text-xl italic text-gray-800 mb-3 border-b border-gray-300 pb-2">Tappe dell'itinerario</h3>
        <div className="space-y-1 mt-4">
          {points.map((point, index) => (
            <div 
              key={point.id} 
              className="flex items-start gap-4 p-3 group hover:bg-black/5 cursor-pointer transition-colors"
              onClick={() => onSelectPoint(point)}
            >
              <div className="flex-shrink-0 bg-[#1C1C1C] text-[#EDE5D0] rounded-full h-8 w-8 flex items-center justify-center font-bold font-sans-display">
                {index + 1}
              </div>
              <div>
                <p className="font-sans-display font-bold text-gray-800 group-hover:text-[#134A79]">{point.title}</p>
                <p className="italic text-sm text-gray-600 line-clamp-1">{point.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ItinerariesView: React.FC<ItinerariesViewProps> = ({ itineraries, onSelectPoint }) => {
  const pointsMap = useMemo(() => new Map(allPoints.map(p => [p.id, p])), []);

  return (
    <div>
       <header className="mb-8 border-b-2 border-black pb-4 text-center">
        <h1 className="font-sans-display text-4xl sm:text-5xl font-bold text-[#1C1C1C]">Itinerari Tematici</h1>
      </header>
      <div>
        {itineraries.map(itinerary => (
          <ItineraryCard 
            key={itinerary.id} 
            itinerary={itinerary} 
            points={itinerary.pointIds.map(id => pointsMap.get(id)).filter((p): p is Point => p !== undefined)}
            onSelectPoint={onSelectPoint}
          />
        ))}
      </div>
    </div>
  );
};

export default ItinerariesView;