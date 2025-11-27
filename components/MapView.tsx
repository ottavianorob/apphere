
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

const MapView: React.FC<MapViewProps> = ({ points, onSelectPoint, categories, periods }) => {
  const { data: userLocation, loading, error } = useGeolocation();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);
  const periodMap = useMemo(() => new Map(periods.map(p => [p.id, p.name])), [periods]);

  const filteredAndSortedPoints = useMemo(() => {
    let filtered = points.filter(p => 
      (filterCategory === 'all' || p.categoryId === filterCategory) &&
      (filterPeriod === 'all' || p.periodId === filterPeriod)
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
  }, [points, userLocation, filterCategory, filterPeriod]);

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

      <div className="border-t border-b border-gray-300 py-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">Filtra per Categoria</label>
          <select id="category-filter" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full bg-white/50 border-gray-300 rounded-sm text-[#1C1C1C] focus:ring-[#134A79] focus:border-[#134A79]">
            <option value="all">Tutte le categorie</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="period-filter" className="block text-sm font-medium text-gray-700 mb-1">Filtra per Periodo</label>
          <select id="period-filter" value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)} className="w-full bg-white/50 border-gray-300 rounded-sm text-[#1C1C1C] focus:ring-[#134A79] focus:border-[#134A79]">
            <option value="all">Tutti i periodi</option>
            {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
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
