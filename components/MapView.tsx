
import React, { useState, useMemo } from 'react';
import { Point, Category, Period } from '../types';
import useGeolocation from '../hooks/useGeolocation';
import MapPinIcon from './icons/MapPinIcon';

interface MapViewProps {
  points: Point[];
  onSelectPoint: (point: Point) => void;
  categories: Category[];
  periods: Period[];
}

// Haversine formula to calculate distance
const getDistance = (coords1: { latitude: number; longitude: number; }, coords2: { latitude: number; longitude: number; }) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // km

  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLon = toRad(coords2.longitude - coords1.longitude);
  const lat1 = toRad(coords1.latitude);
  const lat2 = toRad(coords2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};


const PointListItem: React.FC<{ point: Point; distance?: number | null; onSelect: () => void; categoryName: string; periodName: string; }> = ({ point, distance, onSelect, categoryName, periodName }) => (
  <div
    className="border-b border-gray-300/80 py-6 group cursor-pointer"
    onClick={onSelect}
  >
    <div className="flex flex-col sm:flex-row gap-6">
      <img src={point.photos[0].url} alt={point.title} className="w-full sm:w-48 h-48 object-cover flex-shrink-0" />
      <div className="flex-grow">
         {distance !== null && distance !== undefined && (
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <MapPinIcon className="w-4 h-4 mr-1.5" />
            <span>Distanza: {distance.toFixed(1)} km</span>
          </div>
        )}
        <h3 className="font-serif-display text-2xl font-bold text-[#134A79] mb-2 group-hover:text-[#B1352E] transition-colors">{point.title}</h3>
        <div className="flex flex-wrap gap-2 mb-3">
           <span className={`text-xs font-medium px-2 py-1 ${point.categoryId === 'societa' ? 'bg-[#B1352E]/10 text-[#B1352E]' : 'bg-[#134A79]/10 text-[#134A79]'}`}>{categoryName}</span>
           <span className="text-xs font-medium bg-gray-500/10 text-gray-600 px-2 py-1">{periodName}</span>
        </div>
        <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">{point.description}</p>
      </div>
    </div>
  </div>
);

// Color mapping for category buttons
const categoryColors: { [key: string]: { selected: string; unselected: string; ring: string; } } = {
  'storia':   { selected: 'bg-sky-700 text-white', unselected: 'text-sky-700 border border-sky-700 bg-transparent', ring: 'focus:ring-sky-500' },
  'arte':     { selected: 'bg-amber-600 text-white', unselected: 'text-amber-600 border border-amber-600 bg-transparent', ring: 'focus:ring-amber-500' },
  'societa':  { selected: 'bg-red-700 text-white', unselected: 'text-red-700 border border-red-700 bg-transparent', ring: 'focus:ring-red-500' },
  'cinema':   { selected: 'bg-emerald-600 text-white', unselected: 'text-emerald-600 border border-emerald-600 bg-transparent', ring: 'focus:ring-emerald-500' },
  'musica':   { selected: 'bg-indigo-600 text-white', unselected: 'text-indigo-600 border border-indigo-600 bg-transparent', ring: 'focus:ring-indigo-500' },
};
const defaultColors = { selected: 'bg-gray-600 text-white', unselected: 'text-gray-600 border border-gray-600 bg-transparent', ring: 'focus:ring-gray-500' };

const MapView: React.FC<MapViewProps> = ({ points, onSelectPoint, categories, periods }) => {
  const { data: userLocation, loading, error } = useGeolocation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);
  const periodMap = useMemo(() => new Map(periods.map(p => [p.id, p.name])), [periods]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategories(prev => {
      const isSelected = prev.includes(categoryId);
      if (isSelected) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const filteredAndSortedPoints = useMemo(() => {
    const isFilteringActive = selectedCategories.length > 0;
    
    let filtered = points.filter(p => 
      !isFilteringActive || selectedCategories.includes(p.categoryId)
    );

    if (userLocation) {
      return filtered
        .map(point => ({
          ...point,
          distance: getDistance(userLocation, point.coordinates),
        }))
        .sort((a, b) => a.distance - b.distance);
    }
    
    return filtered.map(point => ({ ...point, distance: undefined }));
  }, [points, userLocation, selectedCategories]);

  return (
    <div>
      <header className="mb-8 text-center border-b-2 border-black pb-4">
        <h1 className="font-serif-display text-6xl font-bold text-[#1C1C1C]">Cosa è successo qui?</h1>
        <p className="text-gray-600 mt-2 text-lg">Esplora i luoghi e le loro storie nascoste.</p>
        {loading && <p className="text-[#134A79] text-sm mt-2">Acquisizione della posizione in corso...</p>}
        {error && <p className="text-[#B1352E] text-sm mt-2">Impossibile ottenere la posizione: {error.message}</p>}
      </header>

      <div className="h-96 bg-gray-200 mb-8 flex items-center justify-center text-gray-500 text-2xl font-serif-display">
        Mappa Interattiva
      </div>

      <div className="border-t border-b border-gray-300 py-4 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3 text-center sm:text-left">Filtra per Categoria</p>
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {categories.map(category => {
            const isSelected = selectedCategories.includes(category.id);
            const noFilterActive = selectedCategories.length === 0;
            const colors = categoryColors[category.id] || defaultColors;
            
            const buttonClasses = (isSelected || noFilterActive) 
              ? colors.selected 
              : colors.unselected;
            
            return (
              <button 
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#EDE5D0] ${buttonClasses} ${colors.ring}`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        {filteredAndSortedPoints.map(point => (
          <PointListItem 
            key={point.id} 
            point={point}
            distance={point.distance}
            onSelect={() => onSelectPoint(point)} 
            categoryName={categoryMap.get(point.categoryId) || ''}
            periodName={periodMap.get(point.periodId) || ''}
          />
        ))}
      </div>
    </div>
  );
};

export default MapView;