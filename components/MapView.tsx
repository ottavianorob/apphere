import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactMapGL, { Marker, NavigationControl, MapRef } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import { Point, Category, Period, Coordinates } from '../types';
import useGeolocation from '../hooks/useGeolocation';
import MapPinIcon from './icons/MapPinIcon';
import DirectionTriangleIcon from './icons/DirectionTriangleIcon';
import CalendarIcon from './icons/CalendarIcon';
import UserLocationMarker from './UserLocationMarker';
import LocateIcon from './icons/LocateIcon';

// Fix for cross-origin error in sandboxed environments by setting worker URL
(maplibregl as any).workerURL = "https://aistudiocdn.com/maplibre-gl@^4.3.2/dist/maplibre-gl-csp-worker.js";

interface MapViewProps {
  points: Point[];
  onSelectPoint: (point: Point) => void;
  categories: Category[];
  periods: Period[];
}

// Haversine formula to calculate distance
const getDistance = (coords1: Coordinates, coords2: Coordinates) => {
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

// Formula to calculate bearing
const getBearing = (start: Coordinates, end: Coordinates) => {
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const toDeg = (rad: number) => rad * (180 / Math.PI);

  const lat1 = toRad(start.latitude);
  const lon1 = toRad(start.longitude);
  const lat2 = toRad(end.latitude);
  const lon2 = toRad(end.longitude);

  const deltaLon = lon2 - lon1;

  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
  
  let brng = Math.atan2(y, x);
  brng = toDeg(brng);
  
  return (brng + 360) % 360; // Normalize to 0-360
};

const PointListItem: React.FC<{ point: Point; distance?: number | null; bearing?: number | null; onSelect: () => void; categoryName?: string; }> = ({ point, distance, bearing, onSelect, categoryName }) => {
  const categoryPillColors: { [key: string]: string } = {
    'storia':   'bg-sky-700 text-white',
    'arte':     'bg-amber-600 text-white',
    'societa':  'bg-red-700 text-white',
    'cinema':   'bg-emerald-600 text-white',
    'musica':   'bg-indigo-600 text-white',
  };
  const defaultPillColor = 'bg-gray-600 text-white';
  const categoryColorClass = categoryPillColors[point.categoryId] || defaultPillColor;

  return (
    <div
      className="border-b border-gray-300/80 group cursor-pointer flex items-center gap-4 py-4"
      onClick={onSelect}
    >
      {/* Left: Directional Circle */}
      {distance !== undefined && distance !== null && bearing !== undefined && bearing !== null ? (
        <div className="flex-shrink-0 w-24 h-24 bg-gray-200/50 rounded-full flex flex-col items-center justify-center relative border-2 border-gray-300/80">
          <div className="absolute inset-0 transition-transform duration-500 ease-in-out" style={{ transform: `rotate(${bearing}deg)` }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[4px]">
              <DirectionTriangleIcon className="text-gray-800" />
            </div>
          </div>
          <span className="font-sans-display font-bold text-3xl text-[#1C1C1C] mt-1">{distance.toFixed(1)}</span>
          <span className="font-sans-display text-xs text-gray-600 -mt-1">km</span>
        </div>
      ) : (
        <div className="flex-shrink-0 w-24 h-24 bg-gray-200/50 rounded-full flex items-center justify-center border-2 border-gray-300/80">
          <MapPinIcon className="w-8 h-8 text-gray-400" />
        </div>
      )}

      {/* Right: Info */}
      <div className="flex-grow">
        {categoryName && (
           <div className="mb-2">
            <span className={`inline-block px-3 py-1 text-xs font-bold font-sans-display rounded-full ${categoryColorClass}`}>
              {categoryName}
            </span>
          </div>
        )}
        <h3 className="font-serif-display text-xl font-semibold text-[#134A79] group-hover:text-[#B1352E] transition-colors">{point.title}</h3>
        <div className="mt-2 flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 font-sans-display">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 flex-shrink-0 text-gray-500" />
            <span>{point.eventDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPinIcon className="w-4 h-4 flex-shrink-0 text-gray-500" />
            <span>{point.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};


// Color mapping for category buttons
const categoryColors: { [key: string]: { selected: string; unselected: string; ring: string; } } = {
  'storia':   { selected: 'bg-sky-700 text-white', unselected: 'text-sky-700 border border-sky-700 bg-transparent', ring: 'focus:ring-sky-500' },
  'arte':     { selected: 'bg-amber-600 text-white', unselected: 'text-amber-600 border border-amber-600 bg-transparent', ring: 'focus:ring-amber-500' },
  'societa':  { selected: 'bg-red-700 text-white', unselected: 'text-red-700 border border-red-700 bg-transparent', ring: 'focus:ring-red-500' },
  'cinema':   { selected: 'bg-emerald-600 text-white', unselected: 'text-emerald-600 border border-emerald-600 bg-transparent', ring: 'focus:ring-emerald-500' },
  'musica':   { selected: 'bg-indigo-600 text-white', unselected: 'text-indigo-600 border border-indigo-600 bg-transparent', ring: 'focus:ring-indigo-500' },
};
const defaultColors = { selected: 'bg-gray-600 text-white', unselected: 'text-gray-600 border border-gray-600 bg-transparent', ring: 'focus:ring-gray-500' };

// Color mapping for map pins
const mapPinColors: { [key: string]: string } = {
  'storia': 'text-sky-700',
  'arte': 'text-amber-600',
  'societa': 'text-red-700',
  'cinema': 'text-emerald-600',
  'musica': 'text-indigo-600',
};
const defaultPinColor = 'text-[#B1352E]';

const MapView: React.FC<MapViewProps> = ({ points, onSelectPoint, categories, periods }) => {
  const { data: userLocation, loading, error } = useGeolocation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const MAPTILER_KEY = 'FyvyDlvVMDaQNPtxRXIa';
  const mapRef = useRef<MapRef>(null);
  
  const [viewState, setViewState] = useState({
    longitude: 12.496366, // Rome
    latitude: 41.902782,
    zoom: 5,
    pitch: 50,
    bearing: 0,
  });

  useEffect(() => {
    if (userLocation) {
      setViewState(current => ({
        ...current,
        longitude: userLocation.longitude,
        latitude: userLocation.latitude,
        zoom: 13,
      }));
    }
  }, [userLocation]);

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);
  const periodMap = useMemo(() => new Map(periods.map(p => [p.id, p.name])), [periods]);

  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const formattedDate = today.toLocaleDateString('it-IT', dateOptions);
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

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
  
  const handleLocateMe = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 14,
        pitch: 50,
        bearing: 0,
        duration: 1500,
      });
    }
  };

  const filteredAndSortedPoints = useMemo(() => {
    const isFilteringActive = selectedCategories.length > 0;
    
    let filtered = points.filter(p => 
      !isFilteringActive || selectedCategories.includes(p.categoryId)
    );

    if (userLocation) {
      return filtered
        .map(point => {
          const absoluteBearing = getBearing(userLocation, point.coordinates);
          const relativeBearing = (userLocation.heading !== null && userLocation.heading !== undefined)
            ? absoluteBearing - userLocation.heading
            : absoluteBearing;
          
          return {
            ...point,
            distance: getDistance(userLocation, point.coordinates),
            bearing: relativeBearing,
          };
        })
        .sort((a, b) => a.distance - b.distance);
    }
    
    return filtered.map(point => ({ ...point, distance: undefined, bearing: undefined }));
  }, [points, userLocation, selectedCategories]);

  return (
    <div>
      <header className="mb-8 border-b-2 border-black pb-4 text-center">
        <h1 className="font-sans-display text-4xl sm:text-5xl font-bold text-[#1C1C1C]">Cosa è successo qui?</h1>
        <p className="font-serif-display italic text-lg text-gray-700 mt-2">{capitalizedDate}</p>
        {loading && <p className="font-sans-display text-[#134A79] text-sm mt-2">Acquisizione della posizione in corso...</p>}
        {error && <p className="font-sans-display text-[#B1352E] text-sm mt-2">Impossibile ottenere la posizione: {error.message}</p>}
      </header>

      <div className="h-96 w-full mb-8 bg-gray-200 relative">
        <ReactMapGL
          ref={mapRef}
          mapLib={maplibregl}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          style={{ width: '100%', height: '100%' }}
          mapStyle={`https://api.maptiler.com/maps/0197890d-f9ac-7f85-b738-4eecc9189544/style.json?key=${MAPTILER_KEY}`}
        >
          <NavigationControl position="top-right" showCompass={true} showPitch={true} />
          
          <div className="absolute top-[108px] right-[10px] z-10">
            <button
              onClick={handleLocateMe}
              disabled={!userLocation}
              className="bg-white w-[30px] h-[30px] rounded-sm flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
              aria-label="Centra mappa sulla tua posizione"
              title="Centra mappa sulla tua posizione"
            >
              <LocateIcon className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Custom user location marker */}
          {userLocation && (
            <Marker
              longitude={userLocation.longitude}
              latitude={userLocation.latitude}
              anchor="center"
            >
              <UserLocationMarker heading={userLocation.heading} />
            </Marker>
          )}

          {filteredAndSortedPoints.map(point => {
            const pinColor = mapPinColors[point.categoryId] || defaultPinColor;
            return (
              <Marker
                key={point.id}
                longitude={point.coordinates.longitude}
                latitude={point.coordinates.latitude}
                anchor="bottom"
              >
                <div onClick={() => onSelectPoint(point)} className="cursor-pointer">
                  <MapPinIcon className={`w-8 h-8 ${pinColor} drop-shadow-lg hover:scale-110 transition-transform`} />
                </div>
              </Marker>
            );
          })}
        </ReactMapGL>
      </div>

      <div className="border-t border-b border-gray-300 py-4 mb-6">
        <div className="font-sans-display flex flex-wrap gap-2 justify-center">
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
        {filteredAndSortedPoints.map(point => {
          return (
            <PointListItem 
              key={point.id} 
              point={point}
              distance={point.distance}
              bearing={point.bearing}
              onSelect={() => onSelectPoint(point)}
              categoryName={categoryMap.get(point.categoryId)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MapView;