import React, { useEffect } from 'react';
import ReactMapGL, { Marker } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import { Point, Category } from '../types';
import { characters as allCharacters } from '../data/mockData';
import CloseIcon from './icons/CloseIcon';
import NavigationIcon from './icons/NavigationIcon';
import UserIcon from './icons/UserIcon';
import CalendarIcon from './icons/CalendarIcon';
import MapPinIcon from './icons/MapPinIcon';

// Fix for cross-origin error in sandboxed environments by setting worker URL
(maplibregl as any).workerURL = "https://aistudiocdn.com/maplibre-gl@^4.3.2/dist/maplibre-gl-csp-worker.js";


interface PointDetailModalProps {
  point: Point;
  onClose: () => void;
  categories: Category[];
}

const PointDetailModal: React.FC<PointDetailModalProps> = ({ point, onClose, categories }) => {
  const linkedCharacters = allCharacters.filter(c => point.linkedCharacterIds.includes(c.id));

  const getDirectionsUrl = () => {
    const { latitude, longitude } = point.coordinates;
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    // iOS: Apre Apple Maps o Google Maps se installata
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      return `maps://?daddr=${latitude},${longitude}&q=${encodeURIComponent(point.title)}`;
    }

    // Android: Apre Google Maps o un'altra app di mappe predefinita
    if (/android/i.test(userAgent)) {
      return `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(point.title)})`;
    }

    // Fallback per browser desktop
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  };
  
  const mapsUrl = getDirectionsUrl();
  const category = categories.find(c => c.id === point.categoryId);
  const MAPTILER_KEY = 'FyvyDlvVMDaQNPtxRXIa';


  const categoryPillColors: { [key: string]: string } = {
    'storia': 'bg-sky-700 text-white',
    'arte': 'bg-amber-600 text-white',
    'societa': 'bg-red-700 text-white',
    'cinema': 'bg-emerald-600 text-white',
    'musica': 'bg-indigo-600 text-white',
  };
  const defaultPillColor = 'bg-gray-600 text-white';
  const categoryColorClass = category ? categoryPillColors[category.id] : defaultPillColor;

  const mapPinColors: { [key: string]: string } = {
    'storia': 'text-sky-700',
    'arte': 'text-amber-600',
    'societa': 'text-red-700',
    'cinema': 'bg-emerald-600 text-white',
    'musica': 'text-indigo-600',
  };
  const defaultPinColor = 'text-[#B1352E]';
  const pinColor = mapPinColors[point.categoryId] || defaultPinColor;


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#EDE5D0] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up border border-black/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex-shrink-0">
          <img src={point.photos[0].url} alt={point.photos[0].caption} className="w-full h-64 object-cover rounded-t-lg" />
          <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-1.5 hover:bg-black/60 transition-colors z-10">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <h2 className="font-sans-display text-3xl font-bold text-[#134A79]">{point.title}</h2>

          <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-sans-display">{point.author}</span>
          </div>

          <div className="mt-4 flex items-center flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700 font-sans-display border-b border-t border-gray-300 py-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 flex-shrink-0 text-gray-500" />
              <span>{point.eventDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 flex-shrink-0 text-gray-500" />
              <span>{point.location}</span>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {category && (
              <div>
                <span className={`inline-block px-3 py-1 text-xs font-bold font-sans-display rounded-full ${categoryColorClass}`}>
                  {category.name}
                </span>
              </div>
            )}

            <p className="italic text-[#1C1C1C] whitespace-pre-wrap leading-relaxed text-lg">{point.description}</p>

            {linkedCharacters.length > 0 && (
              <div>
                <h3 className="font-serif-display text-xl italic text-gray-800 mb-3 border-b border-gray-300 pb-1">Personaggi Collegati</h3>
                <div className="space-y-3">
                  {linkedCharacters.map(char => (
                    <a
                      key={char.id}
                      href={char.wikipediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 rounded-lg hover:bg-[#134A79]/10 transition-colors"
                    >
                      {char.profileImageUrl && (
                        <img
                          src={char.profileImageUrl}
                          alt={char.name}
                          className="w-10 h-10 rounded-full object-cover mr-4 border-2 border-white/50"
                        />
                      )}
                      <span className="font-sans-display text-[#134A79] text-base font-semibold">{char.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {point.tags && point.tags.length > 0 && (
              <div>
                <h3 className="font-serif-display text-xl italic text-gray-800 mb-3 border-b border-gray-300 pb-1">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {point.tags.map(tag => (
                    <span key={tag} className="bg-gray-500/10 text-gray-600 px-3 py-1 text-sm font-sans-display font-semibold">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-serif-display text-xl italic text-gray-800 mb-3 border-b border-gray-300 pb-1">Posizione sulla Mappa</h3>
              <div className="h-64 w-full rounded-lg overflow-hidden relative border border-gray-300/80">
                 <ReactMapGL
                  mapLib={maplibregl}
                  initialViewState={{
                    longitude: point.coordinates.longitude,
                    latitude: point.coordinates.latitude,
                    zoom: 15,
                    pitch: 20
                  }}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle={`https://api.maptiler.com/maps/0197890d-f9ac-7f85-b738-4eecc9189544/style.json?key=${MAPTILER_KEY}`}
                  interactive={false}
                >
                  <Marker
                    longitude={point.coordinates.longitude}
                    latitude={point.coordinates.latitude}
                    anchor="bottom"
                  >
                    <MapPinIcon className={`w-8 h-8 ${pinColor} drop-shadow-lg`} />
                  </Marker>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                </ReactMapGL>
              </div>
            </div>
            
            <div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-[#134A79] text-white font-sans-display font-bold rounded-lg shadow-md hover:bg-[#103a60] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#EDE5D0] focus:ring-[#134A79] transition-all duration-200"
              >
                <NavigationIcon className="w-5 h-5 mr-2" />
                <span>Indicazioni</span>
              </a>
            </div>

          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PointDetailModal;