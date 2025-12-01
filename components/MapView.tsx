import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactMapGL, { Marker, NavigationControl, MapRef } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import type { LngLatBounds } from 'maplibre-gl';
import { Poi, Point, Category, Period, Coordinates } from '../types';
import useGeolocation from '../hooks/useGeolocation';
import MapPinIcon from './icons/MapPinIcon';
import CalendarIcon from './icons/CalendarIcon';
import UserLocationMarker from './UserLocationMarker';
import LocateIcon from './icons/LocateIcon';
import CameraIcon from './icons/CameraIcon';
import CategoryIcon from './icons/CategoryIcon';
import PathIcon from './icons/PathIcon';
import AreaIcon from './icons/AreaIcon';

// Fix for cross-origin error in sandboxed environments by setting worker URL
(maplibregl as any).workerURL = "https://aistudiocdn.com/maplibre-gl@^4.3.2/dist/maplibre-gl-csp-worker.js";

interface MapViewProps {
  pois: Poi[];
  onSelectPoi: (poi: Poi) => void;
  categories: Category[];
  periods: Period[];
  allPoints: Point[];
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

// Calculates the geometric center of a set of coordinates (for areas)
const getAreaCentroid = (bounds: Coordinates[]): Coordinates => {
    if (!bounds || bounds.length === 0) {
        return { latitude: 0, longitude: 0 };
    }
    const { latitude, longitude } = bounds.reduce(
        (acc, curr) => ({
            latitude: acc.latitude + curr.latitude,
            longitude: acc.longitude + curr.longitude,
        }),
        { latitude: 0, longitude: 0 }
    );
    return {
        latitude: latitude / bounds.length,
        longitude: longitude / bounds.length,
    };
};

const PoiTypeIcon: React.FC<{ type: 'point' | 'path' | 'area', className: string }> = ({ type, className }) => {
  switch (type) {
    case 'point': return <MapPinIcon className={className} />;
    case 'path': return <PathIcon className={className} />;
    case 'area': return <AreaIcon className={className} />;
    default: return null;
  }
}

const PoiListItem: React.FC<{ poi: Poi; distance?: number | null; onSelect: () => void; categoryName?: string; }> = ({ poi, distance, onSelect, categoryName }) => {
  const categoryPillColors: { [key: string]: string } = {
    'storia':   'bg-sky-700 text-white',
    'arte':     'bg-amber-600 text-white',
    'societa':  'bg-red-700 text-white',
    'cinema':   'bg-emerald-600 text-white',
    'musica':   'bg-indigo-600 text-white',
  };
  const defaultPillColor = 'bg-gray-600 text-white';
  const categoryColorClass = categoryPillColors[poi.categoryId] || defaultPillColor;

  return (
    <div
      className="border-b border-gray-300/80 group cursor-pointer flex items-center gap-4 py-3"
      onClick={onSelect}
    >
      {/* Left: Circular Image and Distance */}
      <div className="flex-shrink-0 w-20 text-center">
        {poi.photos && poi.photos.length > 0 ? (
          <img
            src={poi.photos[0].url}
            alt={`Immagine di copertina per ${poi.title}`}
            className="w-20 h-20 rounded-full object-cover shadow-lg grayscale mix-blend-multiply group-hover:grayscale-0 group-hover:mix-blend-normal transition-all duration-300 ease-in-out"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-200/50 rounded-full flex items-center justify-center border-2 border-gray-300/80">
            <MapPinIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}
        {distance !== undefined && distance !== null && (
          <p className="font-sans-display text-xs text-gray-700 mt-1">
             <span className="font-bold">{distance.toFixed(1)} km</span>
          </p>
        )}
      </div>

      {/* Right: Info */}
      <div className="flex-grow">
        {categoryName && (
           <div className="mb-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold font-sans-display rounded-full ${categoryColorClass}`}>
              <CategoryIcon categoryId={poi.categoryId} className="w-3.5 h-3.5" />
              <span>{categoryName}</span>
            </span>
          </div>
        )}
        <h3 className="font-serif-display text-lg font-semibold text-[#134A79] group-hover:text-[#B1352E] transition-colors">{poi.title}</h3>
        <div className="mt-1 flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 font-sans-display">
            <div className="flex items-center gap-1.5" title={`Tipo: ${poi.type}`}>
              <PoiTypeIcon type={poi.type} className="w-4 h-4 flex-shrink-0 text-gray-500" />
              <span className="capitalize">{poi.type === 'path' ? 'Percorso' : poi.type}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 flex-shrink-0 text-gray-500" />
                <span>{poi.eventDate}</span>
            </div>
          {poi.photos && poi.photos.length > 0 && (
             <div className="flex items-center gap-1.5">
              <CameraIcon className="w-4 h-4 flex-shrink-0 text-gray-500" />
              <span>{poi.photos.length}</span>
            </div>
          )}
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

// Color mapping for map markers
const mapMarkerBgColors: { [key: string]: string } = {
  'storia': 'bg-sky-700',
  'arte': 'bg-amber-600',
  'societa': 'bg-red-700',
  'cinema': 'bg-emerald-600',
  'musica': 'bg-indigo-600',
};
const defaultMarkerBgColor = 'bg-[#B1352E]';

const MapView: React.FC<MapViewProps> = ({ pois, onSelectPoi, categories, periods, allPoints }) => {
  const { data: userLocation, loading, error } = useGeolocation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [mapBounds, setMapBounds] = useState<LngLatBounds | null>(null);
  const MAPTILER_KEY = 'FyvyDlvVMDaQNPtxRXIa';
  const mapRef = useRef<MapRef>(null);
  
  const [viewState, setViewState] = useState({
    longitude: 9.189982, // Milan
    latitude: 45.464204,
    zoom: 12,
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
  const pointsMap = useMemo(() => new Map(allPoints.map(p => [p.id, p])), [allPoints]);

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
  
  const unifiedPois = useMemo(() => {
    return pois.map(poi => {
      let coordinates: Coordinates;
      if (poi.type === 'point') {
        coordinates = poi.coordinates;
      } else if (poi.type === 'path') {
        const firstPoint = pointsMap.get(poi.pointIds[0]);
        coordinates = firstPoint ? firstPoint.coordinates : { latitude: 0, longitude: 0 };
      } else { // area
        coordinates = getAreaCentroid(poi.bounds);
      }
      return { ...poi, markerCoordinates: coordinates };
    });
  }, [pois, pointsMap]);


  const categoryFilteredPois = useMemo(() => {
    const isFilteringActive = selectedCategories.length > 0;
    return unifiedPois.filter(p => 
      !isFilteringActive || selectedCategories.includes(p.categoryId)
    );
  }, [unifiedPois, selectedCategories]);

  const listPois = useMemo(() => {
    let inViewPois = categoryFilteredPois;
    
    if (mapBounds) {
        inViewPois = categoryFilteredPois.filter(p => 
            mapBounds.contains([p.markerCoordinates.longitude, p.markerCoordinates.latitude])
        );
    }
    
    if (userLocation) {
      return inViewPois
        .map(poi => ({
          ...poi,
          distance: getDistance(userLocation, poi.markerCoordinates),
        }))
        .sort((a, b) => a.distance - b.distance);
    }
    
    return inViewPois.map(poi => ({ ...poi, distance: undefined }));
  }, [categoryFilteredPois, mapBounds, userLocation]);

  return (
    <div>
      <header className="mb-8 border-b-2 border-[#2D3748] pb-4 text-center">
        <h1 className="font-sans-display text-4xl sm:text-5xl font-bold text-[#2D3748] tracking-tighter">Cosa è successo qui?</h1>
        <p className="font-serif-display italic text-lg text-gray-700 mt-2">{capitalizedDate}</p>
        {loading && <p className="font-sans-display text-[#134A79] text-sm mt-2">Acquisizione della posizione in corso...</p>}
        {error && <p className="font-sans-display text-[#B1352E] text-sm mt-2">Impossibile ottenere la posizione: {error.message}</p>}
      </header>

      <div className="h-72 sm:h-96 w-full mb-8 bg-gray-200 relative">
        <ReactMapGL
          ref={mapRef}
          mapLib={maplibregl}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          onLoad={() => mapRef.current && setMapBounds(mapRef.current.getBounds())}
          onMoveEnd={() => mapRef.current && setMapBounds(mapRef.current.getBounds())}
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

          {userLocation && (
            <Marker
              longitude={userLocation.longitude}
              latitude={userLocation.latitude}
              anchor="center"
            >
              <UserLocationMarker heading={userLocation.heading} />
            </Marker>
          )}

          {categoryFilteredPois.map(poi => {
            const markerBg = mapMarkerBgColors[poi.categoryId] || defaultMarkerBgColor;
            return (
              <Marker
                key={poi.id}
                longitude={poi.markerCoordinates.longitude}
                latitude={poi.markerCoordinates.latitude}
                anchor="center"
              >
                <div onClick={() => onSelectPoi(poi)} className="cursor-pointer">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${markerBg} shadow-lg ring-2 ring-white/75 hover:scale-110 transition-transform duration-150 ease-in-out`}>
                    <CategoryIcon categoryId={poi.categoryId} className="w-5 h-5 text-white" />
                  </div>
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
                className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FAF7F0] ${buttonClasses} ${colors.ring}`}
              >
                <CategoryIcon categoryId={category.id} className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        {listPois.length > 0 ? (
          listPois.map(poi => (
            <PoiListItem 
              key={poi.id} 
              poi={poi}
              distance={poi.distance}
              onSelect={() => onSelectPoi(poi)}
              categoryName={categoryMap.get(poi.categoryId)}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-600 font-sans-display">
            <p className="font-semibold">Nessun punto di interesse in quest'area.</p>
            <p className="text-sm">Prova a spostare la mappa o a cambiare i filtri.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;