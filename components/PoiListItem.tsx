import React from 'react';
import { Poi } from '../types';
import MapPinIcon from './icons/MapPinIcon';
import CalendarIcon from './icons/CalendarIcon';
import CameraIcon from './icons/CameraIcon';
import UserIcon from './icons/UserIcon';
import CategoryIcon from './icons/CategoryIcon';
import PathIcon from './icons/PathIcon';
import AreaIcon from './icons/AreaIcon';

const PoiTypeIcon: React.FC<{ type: 'point' | 'path' | 'area', className: string }> = ({ type, className }) => {
  switch (type) {
    case 'point': return <MapPinIcon className={className} />;
    case 'path': return <PathIcon className={className} />;
    case 'area': return <AreaIcon className={className} />;
    default: return null;
  }
}

interface PoiListItemProps {
  poi: Poi;
  distance?: number | null;
  onSelect: () => void;
  categoryName?: string;
}

const PoiListItem: React.FC<PoiListItemProps> = ({ poi, distance, onSelect, categoryName }) => {
  const primaryCategoryId = poi.categoryIds[0];
  const categoryPillColors: { [key: string]: string } = {
    'storia':   'bg-sky-700 text-white',
    'arte':     'bg-amber-600 text-white',
    'societa':  'bg-red-700 text-white',
    'cinema':   'bg-emerald-600 text-white',
    'musica':   'bg-indigo-600 text-white',
  };
  const defaultPillColor = 'bg-gray-600 text-white';
  const categoryColorClass = categoryPillColors[primaryCategoryId] || defaultPillColor;

  return (
    <div
      className="border-b border-gray-300/80 group cursor-pointer flex items-center gap-4 py-3"
      onClick={onSelect}
    >
      {/* Left: Circular Image with Type Icon */}
      <div className="flex-shrink-0 w-20 text-center">
        <div className="relative w-20 h-20 mx-auto">
          {poi.photos && poi.photos.length > 0 ? (
            <>
              <img
                src={poi.photos[0].url}
                alt={`Immagine di copertina per ${poi.title}`}
                className="w-full h-full rounded-full object-cover grayscale mix-blend-multiply group-hover:grayscale-0 group-hover:mix-blend-normal transition-all duration-300 ease-in-out"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" title={`Tipo: ${poi.type}`}>
                {/* FIX: Moved inline style to a wrapper div as PoiTypeIcon does not accept a style prop. */}
                <div style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))' }}>
                  <PoiTypeIcon type={poi.type} className="w-10 h-10 text-white" />
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gray-200/50 rounded-full flex items-center justify-center border-2 border-gray-300/80">
              <PoiTypeIcon type={poi.type} className="w-10 h-10 text-gray-400" />
            </div>
          )}
        </div>
        {distance !== undefined && distance !== null && (
          <p className="font-sans-display text-xs text-gray-700 mt-1">
             <span className="font-bold">{distance.toFixed(1)} km</span>
          </p>
        )}
      </div>

      {/* Right: Info */}
      <div className="flex-grow">
        <div className="flex items-center gap-4 mb-1">
          {categoryName && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold font-sans-display rounded-full ${categoryColorClass}`}>
              <CategoryIcon categoryId={primaryCategoryId} className="w-3.5 h-3.5" />
              <span>{categoryName}</span>
            </span>
          )}
          {poi.photos && poi.photos.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600 font-sans-display" title="Numero di fotografie">
              <CameraIcon className="w-4 h-4 flex-shrink-0 text-gray-500" />
              <span className="font-semibold">{poi.photos.length}</span>
            </div>
          )}
        </div>
        
        <h3 className="font-serif-display text-lg font-semibold text-[#134A79] group-hover:text-[#B1352E] transition-colors">{poi.title}</h3>
        
        <div className="mt-1 flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 font-sans-display">
            <div className="flex items-center gap-1.5" title="Autore">
              <UserIcon className="w-4 h-4 flex-shrink-0 text-gray-500" />
              <span>{poi.author}</span>
            </div>
             <div className="flex items-center gap-1.5" title="Luogo">
              <MapPinIcon className="w-4 h-4 flex-shrink-0 text-gray-500" />
              <span>{poi.location}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Data evento">
                <CalendarIcon className="w-4 h-4 flex-shrink-0 text-gray-500" />
                <span>{poi.eventDate}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PoiListItem;
