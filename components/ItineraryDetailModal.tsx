import React, { useMemo, useRef, useEffect } from 'react';
import ReactMapGL, { Marker, LngLatBounds, MapRef } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import { Itinerary, Poi, Coordinates } from '../types';
import CloseIcon from './icons/CloseIcon';
import UserIcon from './icons/UserIcon';
import ClockIcon from './icons/ClockIcon';
import RouteIcon from './icons/RouteIcon';
import CategoryIcon from './icons/CategoryIcon';
import PathIcon from './icons/PathIcon';
import AreaIcon from './icons/AreaIcon';
import MapPinIcon from './icons/MapPinIcon';

// Fix for cross-origin error
(maplibregl as any).workerURL = "https://aistudiocdn.com/maplibre-gl@^4.3.2/dist/maplibre-gl-csp-worker.js";

const getPoiCentroid = (poi: Poi): Coordinates => {
  if (poi.type === 'point') return poi.coordinates;
  if (poi.type === 'path') return poi.pathCoordinates[0] || { latitude: 0, longitude: 0 };
  if (!poi.bounds || poi.bounds.length === 0) return { latitude: 0, longitude: 0 };
  const { latitude, longitude } = poi.bounds.reduce((acc, curr) => ({
      latitude: acc.latitude + curr.latitude,
      longitude: acc.longitude + curr.longitude,
  }), { latitude: 0, longitude: 0 });
  return { latitude: latitude / poi.bounds.length, longitude: longitude / poi.bounds.length };
};

const PoiTypeIcon: React.FC<{ type: 'point' | 'path' | 'area', className: string }> = ({ type, className }) => {
  switch (type) {
    case 'point': return <MapPinIcon className={className} />;
    case 'path': return <PathIcon className={className} />;
    case 'area': return <AreaIcon className={className} />;
    default: return null;
  }
};

interface ItineraryDetailModalProps {
  itinerary: Itinerary;
  allPois: Poi[];
  onClose: () => void;
  onSelectPoiInItinerary: (poi: Poi) => void;
  onSelectTag: (tag: string) => void;
}

const ItineraryDetailModal: React.FC<ItineraryDetailModalProps> = ({ itinerary, allPois, onClose, onSelectPoiInItinerary, onSelectTag }) => {
  const mapRef = useRef<MapRef>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const poisInItinerary = useMemo(() => 
    itinerary.poiIds.map(id => allPois.find(p => p.id === id)).filter((p): p is Poi => !!p),
    [itinerary, allPois]
  );
  
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;
    const resizeObserver = new ResizeObserver(() => {
        mapRef.current?.getMap().resize();
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const MAPTILER_KEY = 'FyvyDlvVMDaQNPtxRXIa';
  const mapMarkerBgColors: { [key: string]: string } = {
    'storia': 'bg-sky-700', 'arte': 'bg-amber-600', 'societa': 'bg-red-700',
    'cinema': 'bg-emerald-600', 'musica': 'bg-indigo-600',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-[#FAF7F0] w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up border border-black/10 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-800 bg-white/60 rounded-full p-1.5 hover:bg-white/90 backdrop-blur-sm transition-colors z-30"><CloseIcon className="w-5 h-5" /></button>
        <div className="overflow-y-auto">
          <div className="p-6">
            <div className="relative flex-shrink-0">
              <img src={itinerary.coverPhoto.url} alt={itinerary.coverPhoto.caption} className="w-full h-64 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>
          </div>
          <div className="px-6 pb-6">
            <h2 className="font-sans-display text-3xl font-bold text-[#134A79]">{itinerary.title}</h2>
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center"><UserIcon className="w-4 h-4 text-gray-600" /></div>
              <span className="font-sans-display">{itinerary.author}</span>
            </div>
            <div className="mt-4 flex items-center flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700 font-sans-display border-b border-t border-gray-300 py-3">
              <div className="flex items-center gap-2"><RouteIcon className="w-4 h-4 flex-shrink-0 text-gray-500" /><span>{poisInItinerary.length} Tappe</span></div>
              <div className="flex items-center gap-2"><ClockIcon className="w-4 h-4 flex-shrink-0 text-gray-500" /><span>{itinerary.estimatedDuration}</span></div>
            </div>
            <div className="mt-6 space-y-6">
              <p className="italic text-[#2D3748] whitespace-pre-wrap leading-relaxed text-lg">{itinerary.description}</p>
              
              {itinerary.tags && itinerary.tags.length > 0 && (
                <div>
                  <h3 className="font-serif-display text-xl italic text-gray-800 mb-3 border-b border-gray-300 pb-1">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {itinerary.tags.map(tag => (
                      <button key={tag} onClick={() => onSelectTag(tag)} className="bg-gray-500/10 text-gray-600 px-3 py-1 text-xs tracking-wide font-sans-display font-semibold hover:bg-gray-500/20 transition-colors">
                        #{tag.toUpperCase().replace(/\s+/g, '')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-serif-display text-xl italic text-gray-800 mb-3 border-b border-gray-300 pb-1">Mappa dell'Itinerario</h3>
                <div ref={mapContainerRef} className="h-64 w-full rounded-lg overflow-hidden relative border border-gray-300/80">
                  <ReactMapGL
                    ref={mapRef}
                    mapLib={maplibregl}
                    initialViewState={{ longitude: 9.189982, latitude: 45.464204, zoom: 12 }}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle={`https://api.maptiler.com/maps/0197890d-f9ac-7f85-b738-4eecc9189544/style.json?key=${MAPTILER_KEY}`}
                    onLoad={event => {
                      const map = event.target;
                      if (poisInItinerary.length > 0) {
                        const firstCoords = getPoiCentroid(poisInItinerary[0]);
                        const bounds = poisInItinerary.reduce((b, p) => {
                          const coords = getPoiCentroid(p);
                          return b.extend([coords.longitude, coords.latitude]);
                        }, new maplibregl.LngLatBounds([firstCoords.longitude, firstCoords.latitude], [firstCoords.longitude, firstCoords.latitude]));
                        map.fitBounds(bounds, { padding: 50, duration: 0 });
                      }
                    }}
                  >
                    {poisInItinerary.map(poi => {
                      const coords = getPoiCentroid(poi);
                      const primaryCategoryId = poi.categoryIds[0];
                      const markerBg = mapMarkerBgColors[primaryCategoryId] || 'bg-[#B1352E]';
                      return (
                        <Marker key={poi.id} longitude={coords.longitude} latitude={coords.latitude} anchor="center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${markerBg} ring-2 ring-white/75`}>
                            <CategoryIcon categoryId={primaryCategoryId} className="w-4 h-4 text-white" />
                          </div>
                        </Marker>
                      );
                    })}
                  </ReactMapGL>
                </div>
              </div>
              <div>
                <h3 className="font-serif-display text-xl italic text-gray-800 mb-3 border-b border-gray-300 pb-1">Tappe</h3>
                <div className="space-y-2 mt-4">
                  {poisInItinerary.map((poi, i) => (
                    <div key={poi.id} className="flex items-start gap-4 p-2 rounded-lg hover:bg-[#134A79]/10 cursor-pointer" onClick={() => onSelectPoiInItinerary(poi)}>
                      <div className="flex-shrink-0 bg-[#2D3748] text-[#FAF7F0] rounded-full h-8 w-8 flex items-center justify-center font-bold font-sans-display">{i + 1}</div>
                      <div>
                        <p className="font-sans-display font-bold text-gray-800">{poi.title}</p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <PoiTypeIcon type={poi.type} className="w-3 h-3"/>
                          <span className="capitalize">{poi.type === 'path' ? 'Percorso' : poi.type}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes fade-in{from{opacity:0}to{opacity:1}}.animate-fade-in{animation:fade-in .3s ease-out forwards}@keyframes slide-up{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}.animate-slide-up{animation:slide-up .3s ease-out forwards}`}</style>
    </div>
  );
};

export default ItineraryDetailModal;