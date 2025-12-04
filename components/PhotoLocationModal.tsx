import React, { useState, useRef } from 'react';
import { MapRef } from 'react-map-gl';
import { Coordinates } from '../types';
import CloseIcon from './icons/CloseIcon';
import MapSelector from './MapSelector';

interface PhotoLocationModalProps {
  onClose: () => void;
  onSave: (coordinates: Coordinates | null) => void;
  initialCoordinates: Coordinates | null;
  poiCoordinates?: Coordinates | null;
}

const PhotoLocationModal: React.FC<PhotoLocationModalProps> = ({ onClose, onSave, initialCoordinates, poiCoordinates }) => {
    const [coords, setCoords] = useState<Coordinates[]>(initialCoordinates ? [initialCoordinates] : []);
    const mapRef = useRef<MapRef>(null);

    const handleSave = () => {
        onSave(coords.length > 0 ? coords[0] : null);
    };
    
    const handleClear = () => {
        setCoords([]);
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[70] p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-[#FAF7F0] w-full max-w-xl flex flex-col animate-slide-up border border-black/10 relative" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 flex items-center justify-between border-b border-gray-300/80">
                  <h2 className="font-sans-display text-xl font-bold text-[#134A79]">Posizione della Foto</h2>
                  <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon className="w-6 h-6" /></button>
                </header>
                <div className="p-6">
                    <p className="font-sans-display text-sm text-gray-600 mb-4">Clicca sulla mappa per impostare o modificare il punto esatto da cui è stata scattata la foto. Se non conosci la posizione, puoi lasciare il campo vuoto.</p>
                    <MapSelector
                        ref={mapRef}
                        coordinates={coords}
                        setCoordinates={setCoords}
                        userLocation={null}
                        initialViewState={
                            initialCoordinates
                                ? { longitude: initialCoordinates.longitude, latitude: initialCoordinates.latitude, zoom: 16 }
                                : poiCoordinates
                                ? { longitude: poiCoordinates.longitude, latitude: poiCoordinates.latitude, zoom: 16 }
                                : undefined
                        }
                    />
                </div>
                 <footer className="p-4 border-t border-gray-300/80 flex justify-between items-center">
                    <button onClick={handleClear} className="px-4 py-2 text-red-700 bg-red-100 font-sans-display font-semibold hover:bg-red-200 transition-colors rounded-md">Rimuovi Posizione</button>
                    <div className="flex gap-3">
                      <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 font-sans-display font-semibold hover:bg-gray-300 transition-colors rounded-md">Annulla</button>
                      <button onClick={handleSave} className="px-4 py-2 text-white bg-[#134A79] font-sans-display font-semibold hover:bg-[#103a60] transition-colors rounded-md">Salva Posizione</button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default PhotoLocationModal;