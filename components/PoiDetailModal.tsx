import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactMapGL, { Marker, Source, Layer, LngLatBounds, MapRef } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import { Poi, Category, Coordinates, Character } from '../types';
import CloseIcon from './icons/CloseIcon';
import NavigationIcon from './icons/NavigationIcon';
import UserIcon from './icons/UserIcon';
import CalendarIcon from './icons/CalendarIcon';
import MapPinIcon from './icons/MapPinIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import CategoryIcon from './icons/CategoryIcon';
import CameraIcon from './icons/CameraIcon';

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
  characters: Character[];
  onSelectCharacter: (characterId: string) => void;
  onSelectTag: (tag: string) => void;
}

const PoiDetailModal: React.FC<PoiDetailModalProps> = ({ poi, onClose, categories, characters, onSelectCharacter, onSelectTag }) => {
  const mapRef = useRef<MapRef>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const linkedCharacters = characters.filter(c => poi.linkedCharacterIds.includes(c.id));

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
  const MAPTILER_KEY = 'get_your_own_OpIi9ZULNHzrESv6T2vL';

  const categoryPillColors: { [key: string]: string } = {
    'storia': 'bg-sky-700 text-white', 'arte': 'bg-amber-600 text-white', 'societa': 'bg-red-700 text-white',
    'cinema': 'bg-emerald-600 text-white', 'musica': 'bg-indigo-600 text-white',
  };
  
  const primaryCategoryId = poi.categoryIds[0];
  const mapMarkerBgColors: { [key: string]: string } = {
    'storia': 'bg-sky-700', 'arte': 'bg-amber-600', 'societa': 'bg-red-700',
    'cinema': 'bg-emerald-600', 'musica': 'bg-indigo-600',
  };
  const markerBg = mapMarkerBgColors[primaryCategoryId] || 'bg-[#B1352E]';

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
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${markerBg} ring-2 ring-white/75`}>
                        <CategoryIcon categoryId={primaryCategoryId} className="w-5 h-5 text-white" />
                    </div>
                </Marker>
            </>
        );
    }

    // Default case for 'point'
    return (
        <Marker longitude={markerCoords.longitude} latitude={markerCoords.latitude} anchor="center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${markerBg} ring-2 ring-white/75`}>
                <CategoryIcon categoryId={primaryCategoryId} className="w-5 h-5 text-white" />
            </div>
        </Marker>
    );

  }, [poi, markerBg, primaryCategoryId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;
    const resizeObserver = new ResizeObserver(() => {
        mapRef.current?.getMap().resize();
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-[#FAF7F0] w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up border border-black/10 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-800 bg-white/60 rounded-full p-1.5 hover:bg-white/90 backdrop-blur-sm transition-colors z-30"><CloseIcon className="w-5 h-5" /></button>
        <div className="overflow-y-auto">
          <div className="p-6">
            <div className="relative flex-shrink-0 group">
              {poi.photos && poi.photos.length > 0 ? (
                <>
                  <img src={poi.photos[currentImageIndex].url} alt={poi.photos[currentImageIndex].caption} className="w-full h-64 object-cover" />
                  {poi.photos.length > 1 && (
                    <>
                      <button onClick={handlePrevImage} disabled={currentImageIndex === 0} className="absolute top-1/2 left-2 -translate-y-1/2 text-white bg-black/40 rounded-full p-1.5 hover:bg-black/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10 opacity-0 group-hover:opacity-100" aria-label="Immagine precedente"><ChevronLeftIcon className="w-6 h-6" /></button>
                      <button onClick={handleNextImage} disabled={currentImageIndex === poi.photos.length - 1} className="absolute top-1/2 right-2 -translate-y-1/2 text-white bg-black/40 rounded-full p-1.5 hover:bg-black/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10 opacity-0 group-hover:opacity-100" aria-label="Immagine successiva"><ChevronRightIcon className="w-6 h-6" /></button>
                    </>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex justify-between items-end">
                    {poi.photos[currentImageIndex].caption && (
                      <p className="text-white text-sm font-sans-display drop-shadow-md max-w-[calc(100%-4rem)]">{poi.photos[currentImageIndex].caption}</p>
                    )}
                    {poi.photos.length > 1 && (
                      <div className="bg-black/50 text-white text-xs font-sans-display font-semibold px-2 py-1 rounded-full ml-auto">{currentImageIndex + 1} / {poi.photos.length}</div>
                    )}
                  </div>
                </>
              ) : (
                <div className="w-full h-64 bg-gray-300 flex items-center justify-center">
                    <CameraIcon className="w-12 h-12 text-gray-500" />
                </div>
              )}
            </div>
          </div>
          
          <div className="px-6 pb-6">
            <h2 className="font-sans-display text-3xl font-bold text-[#134A79]">{poi.title}</h2>
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-600"><div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center"><UserIcon className="w-4 h-4 text-gray-600" /></div><span className="font-sans-display">{poi.author}</span></div>
            <div className="mt-4 flex items-center flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700 font-sans-display border-b border-t border-gray-300 py-3">
              <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 flex-shrink-0 text-gray-500" /><span>{poi.eventDate}</span></div>
              <div className="flex items-center gap-2"><MapPinIcon className="w-4 h-4 flex-shrink-0 text-gray-500" /><span>{poi.location}</span></div>
            </div>
            <div className="mt-6 space-y-6">
              <div className="flex flex-wrap gap-2">
                {poi.categoryIds.map(catId => {
                  const category = categories.find(c => c.id === catId);
                  if (!category) return null;
                  const categoryColorClass = categoryPillColors[category.id] || 'bg-gray-600 text-white';
                  return (
                    <span key={catId} className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-bold font-sans-display rounded-full ${categoryColorClass}`}>
                      <CategoryIcon categoryId={category.id} className="w-4 h-4" />
                      <span>{category.name}</span>
                    </span>
                  );
                })}
              </div>
              <p className="italic text-[#2D3748] whitespace-pre-wrap leading-relaxed text-lg first-letter:text-5xl first-letter:font-normal first-letter:text-[#134A79] first-letter:mr-3 first-letter:float-left">{poi.description}</p>
              
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
                  <div className="flex flex-wrap gap-2">{poi.tags.map(tag => (<button key={tag} onClick={() => onSelectTag(tag)} className="bg-gray-500/10 text-gray-600 px-3 py-1 text-xs tracking-wide font-sans-display font-semibold hover:bg-gray-500/20 transition-colors">#{tag.toUpperCase().replace(/\s+/g, '')}</button>))}</div>
                </div>
              )}
              <div>
                <h3 className="font-serif-display text-xl italic text-gray-800 mb-3 border-b border-gray-300 pb-1">Posizione sulla Mappa</h3>
                <div ref={mapContainerRef} className="h-64 w-full rounded-lg overflow-hidden relative border border-gray-300/80">
                   <ReactMapGL
                      ref={mapRef}
                      mapLib={maplibregl}
                      initialViewState={{ longitude: getMarkerCoordinates().longitude, latitude: getMarkerCoordinates().latitude, zoom: 15, pitch: 20 }}
                      style={{ width: '100%', height: '100%' }}
                      mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${MAPTILER_KEY}`}
                      interactive={false}
                      onLoad={event => {
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
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-[#134A79] text-white font-sans-display font-bold rounded-lg hover:bg-[#103a60] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FAF7F0] focus:ring-[#134A79] transition-all duration-200"><NavigationIcon className="w-5 h-5 mr-2" /><span>Indicazioni</span></a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes fade-in{from{opacity:0}to{opacity:1}}.animate-fade-in{animation:fade-in .3s ease-out forwards}@keyframes slide-up{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}.animate-slide-up{animation:slide-up .3s ease-out forwards}`}</style>
    </div>
  );
};

export default PoiDetailModal;