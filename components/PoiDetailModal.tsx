import React, { useState, useEffect, useMemo } from 'react';
import ReactMapGL, { Marker, Source, Layer, LngLatBounds } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import { Poi, Category, Coordinates } from '../types';
import { characters as allCharacters } from '../data/mockData';
import CloseIcon from './icons/CloseIcon';
import NavigationIcon from './icons/NavigationIcon';
import UserIcon from './icons/UserIcon';
import CalendarIcon from './icons/CalendarIcon';
import MapPinIcon from './icons/MapPinIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import CategoryIcon from './icons/CategoryIcon';

// Fix for cross-origin error in sandboxed environments by setting worker URL
(maplibregl as any).workerURL = "https://aistudiocdn.com/maplibre-gl@^4.3.2/dist/maplibre-gl-csp-worker.js";

// Calculates the geometric center of a set of coordinates (for areas)
const getAreaCentroid = (bounds: Coordinates[]): Coordinates => {
    if (!bounds || bounds.length === 0) return { latitude: 0, longitude: 0 };
    const { latitude, longitude } = bounds.reduce((acc, curr) => ({
        latitude: acc.latitude + curr.latitude,
        longitude: acc.longitude + curr.longitude,
    }), { latitude: 0, longitude: 0 });
    return { latitude: latitude / bounds.length, longitude: longitude / bounds.length };
};

interface PoiDetailModalProps {
  poi: Poi;
  onClose: () => void;
  categories: Category[];
  onSelectCharacter: (characterId: string) => void;
}

const PoiDetailModal: React.FC<PoiDetailModalProps> = ({ poi, onClose, categories, onSelectCharacter }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const linkedCharacters = allCharacters.filter(c => poi.linkedCharacterIds.includes(c.id));

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => Math.min(prev + 1, poi.photos.length - 1));
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => Math.max(prev - 1, 0));
  };
  
  const getMarkerCoordinates = (): Coordinates => {
    if (poi.type === 'point') return poi.coordinates;
    if (poi.type === 'path') return poi.pathCoordinates[0] || { latitude: 0, longitude: 0 };
    return getAreaCentroid(poi.bounds);
  }

  const getDirectionsUrl = () => {
    const { latitude, longitude } = getMarkerCoordinates();
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      return `maps://?daddr=${latitude},${longitude}&q=${encodeURIComponent(poi.title)}`;
    }
    if (/android/i.test(userAgent)) {
      return `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(poi.title)})`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  };
  
  const mapsUrl = getDirectionsUrl();
  const category = categories.find(c => c.id === poi.categoryId);
  const MAPTILER_KEY = 'FyvyDlvVMDaQNPtxRXIa';

  const categoryPillColors: { [key: string]: string } = {
    'storia': 'bg-sky-700 text-white', 'arte': 'bg-amber-600 text-white', 'societa': 'bg-red-700 text-white',
    'cinema': 'bg-emerald-600 text-white', 'musica': 'bg-indigo-600 text-white',
  };
  const categoryColorClass = category ? categoryPillColors[category.id] : 'bg-gray-600 text-white';

  const mapMarkerBgColors: { [key: string]: string } = {
    'storia': 'bg-sky-700', 'arte': 'bg-amber-600', 'societa': 'bg-red-700',
    'cinema': 'bg-emerald-600', 'musica': 'bg-indigo-600',
  };
  const markerBg = mapMarkerBgColors[poi.categoryId] || 'bg-[#B1352E]';

  const mapContent = useMemo(() => {
    const markerCoords = getMarkerCoordinates();
    
    if (poi.type === 'path') {
        if (poi.pathCoordinates.length === 0) return null;
        const pathGeoJSON = {
            type: 'Feature' as const,
            geometry: { type: 'LineString' as const, coordinates: poi.pathCoordinates.map(p => [p.longitude, p.latitude]) }
        };
        
        return (
            <>
                <Source id="path" type="geojson" data={pathGeoJSON}>
                    <Layer id="path-layer" type="line" paint={{ 'line-color': '#B1352E', 'line-width': 3, 'line-dasharray': [2, 2] }} />
                </Source>
                <Marker longitude={markerCoords.longitude} latitude={markerCoords.latitude} anchor="center">
                     <div className={`w-5 h-5 rounded-full flex items-center justify-center ${markerBg} ring-2 ring-white/75`}></div>
                </Marker>
            </>
        );
    } else if (poi.type === 'area') {
        if (poi.bounds.length === 0) return null;
        const areaGeoJSON = {
            type: 'Feature' as const,
            geometry: { type: 'Polygon' as const, coordinates: [[...poi.bounds, poi.bounds[0]].map(c => [c.longitude, c.latitude])] }
        };
        
        return (
             <>
                <Source id="area" type="geojson" data={areaGeoJSON}>
                    <Layer id="area-layer" type="fill" paint={{ 'fill-color': '#134A79', 'fill-opacity': 0.2, 'fill-outline-color': '#134A79' }} />
                </Source>
                <Marker longitude={markerCoords.longitude} latitude={markerCoords.latitude} anchor="center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${markerBg} shadow-lg ring-2 ring-white/75`}>
                        <CategoryIcon categoryId={poi.categoryId} className="w-5 h-5 text-white" />
                    </div>
                </Marker>
            </>
        );
    }

    // Default case for 'point'
    return (
        <Marker longitude={markerCoords.longitude} latitude={markerCoords.latitude} anchor="center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${markerBg} shadow-lg ring-2 ring-white/75`}>
                <CategoryIcon categoryId={poi.categoryId} className="w-5 h-5 text-white" />
            </div>
        </Marker>
    );

  }, [poi, markerBg]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-[#FAF7F0] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up border border-black/10" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex-shrink-0 group">
          <img src={poi.photos[currentImageIndex].url} alt={poi.photos[currentImageIndex].caption} className="w-full h-64 object-cover rounded-t-lg" />
          <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-1.5 hover:bg-black/60 transition-colors z-20"><CloseIcon className="w-5 h-5" /></button>
          {poi.photos.length > 1 && (
            <>
              <button onClick={handlePrevImage} disabled={currentImageIndex === 0} className="absolute top-1/2 left-2 -translate-y-1/2 text-white bg-black/40 rounded-full p-1.5 hover:bg-black/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10 opacity-0 group-hover:opacity-100" aria-label="Immagine precedente"><ChevronLeftIcon className="w-6 h-6" /></button>
              <button onClick={handleNextImage} disabled={currentImageIndex === poi.photos.length - 1} className="absolute top-1/2 right-2 -translate-y-1/2 text-white bg-black/40 rounded-full p-1.5 hover:bg-black/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10 opacity-0 group-hover:opacity-100" aria-label="Immagine successiva"><ChevronRightIcon className="w-6 h-6" /></button>
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs font-sans-display font-semibold px-2 py-1 rounded-full z-10">{currentImageIndex + 1} / {poi.photos.length}</div>
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-t-lg"></div>
        </div>
        <div className="overflow-y-auto p-6">
          <h2 className="font-sans-display text-3xl font-bold text-[#134A79]">{poi.title}</h2>
          <div className="flex items-center gap-2 mt-3 text-sm text-gray-600"><div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center"><UserIcon className="w-4 h-4 text-gray-600" /></div><span className="font-sans-display">{poi.author}</span></div>
          <div className="mt-4 flex items-center flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700 font-sans-display border-b border-t border-gray-300 py-3">
            <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 flex-shrink-0 text-gray-500" /><span>{poi.eventDate}</span></div>
            <div className="flex items-center gap-2"><MapPinIcon className="w-4 h-4 flex-shrink-0 text-gray-500" /><span>{poi.location}</span></div>
          </div>
          <div className="mt-6 space-y-6">
            {category && <div><span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-bold font-sans-display rounded-full ${categoryColorClass}`}><CategoryIcon categoryId={category.id} className="w-4 h-4" /><span>{category.name}</span></span></div>}
            <p className="italic text-[#2D3748] whitespace-pre-wrap leading-relaxed text-lg">{poi.description}</p>
            
            {linkedCharacters.length > 0 && (
              <div>
                <h3 className="font-serif-display text-xl italic text-gray-800 mb-3 border-b border-gray-300 pb-1">Personaggi Collegati</h3>
                <div className="space-y-3">{linkedCharacters.map(char => (
                  <button key={char.id} onClick={() => onSelectCharacter(char.id)} className="flex items-center p-2 rounded-lg hover:bg-[#134A79]/10 transition-colors text-left w-full">
                    {char.photos.length > 0 && <img src={char.photos[0].url} alt={char.name} className="w-10 h-10 rounded-full object-cover mr-4 border-2 border-white/50" />}
                    <span className="font-sans-display text-[#134A79] text-base font-semibold">{char.name}</span>
                  </button>
                ))}</div>
              </div>
            )}
            {poi.tags && poi.tags.length > 0 && (
              <div>
                <h3 className="font-serif-display text-xl italic text-gray-800 mb-3 border-b border-gray-300 pb-1">Tags</h3>
                <div className="flex flex-wrap gap-2">{poi.tags.map(tag => (<span key={tag} className="bg-gray-500/10 text-gray-600 px-3 py-1 text-sm font-sans-display font-semibold">#{tag}</span>))}</div>
              </div>
            )}
            <div>
              <h3 className="font-serif-display text-xl italic text-gray-800 mb-3 border-b border-gray-300 pb-1">Posizione sulla Mappa</h3>
              <div className="h-64 w-full rounded-lg overflow-hidden relative border border-gray-300/80">
                 <ReactMapGL
                    mapLib={maplibregl}
                    initialViewState={{ longitude: getMarkerCoordinates().longitude, latitude: getMarkerCoordinates().latitude, zoom: 15, pitch: 20 }}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle={`https://api.maptiler.com/maps/0197890d-f9ac-7f85-b738-4eecc9189544/style.json?key=${MAPTILER_KEY}`}
                    interactive={false}
                    onLoad={ event => {
                        const map = event.target;
                        let bounds: LngLatBounds | undefined;
                        if(poi.type === 'path' && poi.pathCoordinates.length > 1) {
                           bounds = poi.pathCoordinates.reduce((b, p) => b.extend([p.longitude, p.latitude]), new maplibregl.LngLatBounds([poi.pathCoordinates[0].longitude, poi.pathCoordinates[0].latitude],[poi.pathCoordinates[0].longitude, poi.pathCoordinates[0].latitude]));
                        } else if(poi.type === 'area' && poi.bounds.length > 0) {
                           bounds = poi.bounds.reduce((b, c) => b.extend([c.longitude, c.latitude]), new maplibregl.LngLatBounds([poi.bounds[0].longitude, poi.bounds[0].latitude],[poi.bounds[0].longitude, poi.bounds[0].latitude]));
                        }
                        if (bounds) {
                           map.fitBounds(bounds, { padding: 40, duration: 0 });
                        }
                    }}
                >
                  {mapContent}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                </ReactMapGL>
              </div>
            </div>
            <div>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-[#134A79] text-white font-sans-display font-bold rounded-lg shadow-md hover:bg-[#103a60] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FAF7F0] focus:ring-[#134A79] transition-all duration-200"><NavigationIcon className="w-5 h-5 mr-2" /><span>Indicazioni</span></a>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes fade-in{from{opacity:0}to{opacity:1}}.animate-fade-in{animation:fade-in .3s ease-out forwards}@keyframes slide-up{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}.animate-slide-up{animation:slide-up .3s ease-out forwards}`}</style>
    </div>
  );
};

export default PoiDetailModal;