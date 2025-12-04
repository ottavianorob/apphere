import React, { useMemo, useRef, useEffect, useState } from 'react';
import ReactMapGL, { Marker, LngLatBounds, MapRef, Source, Layer } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import { Itinerary, Poi, Coordinates } from '../types';
import CloseIcon from './icons/CloseIcon';
import UserIcon from './icons/UserIcon';
import ClockIcon from './icons/ClockIcon';
import RouteIcon from './icons/RouteIcon';
import CategoryIcon from './icons/CategoryIcon';
import MapPinIcon from './icons/MapPinIcon';
import StarIcon from './icons/StarIcon';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';

// Fix for cross-origin error
(maplibregl as any).workerURL = "https://aistudiocdn.com/maplibre-gl@^4.3.2/dist/maplibre-gl-csp-worker.js";

const getPoiCentroid = (poi: Poi): Coordinates => poi.coordinates;

interface ItineraryDetailModalProps {
  itinerary: Itinerary;
  allPois: Poi[];
  onClose: () => void;
  onSelectPoiInItinerary: (poi: Poi) => void;
  onSelectTag: (tag: string) => void;
  onToggleFavorite: (itineraryId: string) => void;
  onModify: (type: string, data: any) => void;
  onDelete: (table: string, id: string, name: string) => void;
}

const ItineraryDetailModal: React.FC<ItineraryDetailModalProps> = ({ itinerary, allPois, onClose, onSelectPoiInItinerary, onSelectTag, onToggleFavorite, onModify, onDelete }) => {
  const mapRef = useRef<MapRef>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [routeGeoJson, setRouteGeoJson] = useState<any>(null);

  const poisInItinerary = useMemo(() => 
    itinerary.poiIds.map(id => allPois.find(p => p.id === id)).filter((p): p is Poi => !!p),
    [itinerary, allPois]
  );
  
  const MAPTILER_KEY = 'FyvyDlvVMDaQNPtxRXIa';

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;
    const resizeObserver = new ResizeObserver(() => {
        mapRef.current?.getMap().resize();
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);
  
  useEffect(() => {
    const fetchRoute = async () => {
      if (poisInItinerary.length < 2) {
        setRouteGeoJson(null);
        return;
      }

      const coordinatesString = poisInItinerary
        .map(poi => `${poi.coordinates.longitude},${poi.coordinates.latitude}`)
        .join(';');

      const routingUrl = `https://api.maptiler.com/routing/walking/${coordinatesString}.json?alternatives=false&steps=false&overview=full&geometries=geojson&key=${MAPTILER_KEY}`;

      try {
        const response = await fetch(routingUrl);
        if (!response.ok) throw new Error(`Routing API failed: ${response.statusText}`);
        
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const routeGeometry = data.routes[0].geometry;
          setRouteGeoJson({
            type: 'Feature',
            properties: {},
            geometry: routeGeometry,
          });
        }
      } catch (error) {
        console.error("Error fetching walking route:", error);
      }
    };

    fetchRoute();
  }, [poisInItinerary, MAPTILER_KEY]);

  const mapMarkerBgColors: { [key: string]: string } = {
    'storia': 'bg-sky-700', 'arte': 'bg-amber-600', 'societa': 'bg-red-700',
    'cinema': 'bg-emerald-600', 'musica': 'bg-indigo-600',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-[#FAF7F0] w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up border border-black/10 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-800 bg-white/60 rounded-full p-1.5 hover:bg-white/90 backdrop-blur-sm transition-colors z-30"><CloseIcon className="w-5 h-5" /></button>
        <div className="overflow-y-auto">
          <div className="p-6 pb-0">
            <div className="relative flex-shrink-0">
              <img src={itinerary.coverPhoto.url} alt={itinerary.coverPhoto.caption} className="w-full h-64 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>
          </div>
          <div className="p-6">
            <h2 className="font-sans-display text-3xl font-bold text-[#134A79]">{itinerary.title}</h2>
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center"><UserIcon className="w-4 h-4 text-gray-600" /></div>
              <span className="font-sans-display">{itinerary.author}</span>
            </div>
            <div className="mt-4 flex items-center flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700 font-sans-display border-b border-t border-gray-300 py-3">
              <div className="flex items-center gap-2"><RouteIcon className="w-4 h-4 flex-shrink-0 text-gray-500" /><span>{poisInItinerary.length} Tappe</span></div>
              <div className="flex items-center gap-2"><ClockIcon className="w-4 h-4 flex-shrink-0 text-gray-500" /><span>{itinerary.estimatedDuration}</span></div>
               <div className="flex items-center gap-2">
                <button onClick={() => onToggleFavorite(itinerary.id)} className="flex items-center gap-1.5 group transition-transform active:scale-95">
                  <StarIcon 
                    isFilled={itinerary.isFavorited} 
                    className={`w-5 h-5 transition-colors ${itinerary.isFavorited ? 'text-yellow-500' : 'text-gray-500 group-hover:text-yellow-400'}`}
                  />
                  <span className="font-semibold text-gray-700">{itinerary.favoriteCount}</span>
                </button>
              </div>
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
                    {routeGeoJson && (
                      <Source id="route" type="geojson" data={routeGeoJson}>
                        <Layer
                          id="route-layer"
                          type="line"
                          paint={{
                            'line-color': '#B1352E',
                            'line-width': 4,
                            'line-opacity': 0.85,
                            'line-dasharray': [2, 2],
                          }}
                          layout={{
                            'line-join': 'round',
                            'line-cap': 'round',
                          }}
                        />
                      </Source>
                    )}
                    {poisInItinerary.map((poi, index) => {
                      const coords = getPoiCentroid(poi);
                      const primaryCategoryId = poi.categoryIds[0];
                      const markerBg = mapMarkerBgColors[primaryCategoryId] || 'bg-[#B1352E]';
                      return (
                        <Marker key={poi.id} longitude={coords.longitude} latitude={coords.latitude} anchor="center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white font-sans-display ${markerBg} ring-2 ring-white/75 shadow-md`}>
                            {index + 1}
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
                          <MapPinIcon className="w-3 h-3"/>
                          <span>{poi.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
               {/* Admin Zone */}
              <div className="mt-8 pt-4 border-t-2 border-dashed border-red-300 bg-red-50/50 rounded-md p-4">
                <h3 className="font-sans-display text-sm font-bold text-red-800/80 mb-3 uppercase tracking-wider">Zona Admin</h3>
                <div className="flex gap-4">
                    <button 
                        onClick={() => onModify('itinerary', itinerary)} 
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-white font-sans-display text-sm font-bold rounded-md hover:bg-yellow-600 transition-colors"
                    >
                        <PencilIcon className="w-4 h-4" />
                        <span>Modifica</span>
                    </button>
                    <button 
                        onClick={() => {
                            onClose();
                            setTimeout(() => onDelete('itineraries', itinerary.id, itinerary.title), 50);
                        }} 
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-sans-display text-sm font-bold rounded-md hover:bg-red-700 transition-colors"
                    >
                        <TrashIcon className="w-4 h-4" />
                        <span>Elimina</span>
                    </button>
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