import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import ReactMapGL, { Marker, Source, Layer, MapRef } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import { Poi, Category, Period, Character as CharacterType, Coordinates, Point, Path, Area, Photo } from '../types';
import CloseIcon from './icons/CloseIcon';
import CategoryIcon from './icons/CategoryIcon';
import CameraIcon from './icons/CameraIcon';
import useGeolocation from '../hooks/useGeolocation';

// This is a simplified version of the AddPoiModal for editing.
// For a full implementation, you'd handle existing photo management (deleting), etc.

(maplibregl as any).workerURL = "https://aistudiocdn.com/maplibre-gl@^4.3.2/dist/maplibre-gl-csp-worker.js";

type PhotoUpload = {
    file: File;
    dataUrl: string;
    caption: string;
};

const getPeriodIdFromYear = (year: number, periods: Period[]): string | null => {
    const period = periods.find(p => year >= p.start_year && year <= p.end_year);
    return period ? period.id : null;
};

const extractYear = (dateString: string): number | null => {
    if (dateString && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return parseInt(dateString.split('-')[0], 10);
    }
    return null;
};

// Converts Italian date string "gg mese aaaa" to "yyyy-mm-dd"
const italianDateToISODate = (dateString: string) => {
    const months: { [key: string]: string } = {
        'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04', 'maggio': '05', 'giugno': '06',
        'luglio': '07', 'agosto': '08', 'settembre': '09', 'ottobre': '10', 'novembre': '11', 'dicembre': '12'
    };
    const parts = dateString.split(' ');
    if (parts.length !== 3) return '';
    const day = parts[0].padStart(2, '0');
    const month = months[parts[1].toLowerCase()];
    const year = parts[2];
    return `${year}-${month}-${day}`;
};

interface EditPoiModalProps {
  onClose: () => void;
  onSave: (
    poiId: string,
    poiData: Omit<Poi, 'id' | 'creationDate' | 'author' | 'photos'>,
    photosToUpload: { file: File, caption: string }[],
    photosToDelete: Photo[]
  ) => void;
  poi: Poi;
  categories: Category[];
  periods: Period[];
  characters: CharacterType[];
}

const EditPoiModal: React.FC<EditPoiModalProps> = ({ onClose, onSave, poi, categories, periods, characters }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dateMode, setDateMode] = useState<'date' | 'period'>('date');
    const [eventDate, setEventDate] = useState('');
    const [periodId, setPeriodId] = useState<string | null>(null);
    const [type, setType] = useState<'point' | 'path' | 'area'>('point');
    const [categoryIds, setCategoryIds] = useState<string[]>([]);
    const [coordinates, setCoordinates] = useState<Coordinates[]>([]);
    const [existingPhotos, setExistingPhotos] = useState<Photo[]>([]);
    const [newPhotos, setNewPhotos] = useState<PhotoUpload[]>([]);
    const [photosToDelete, setPhotosToDelete] = useState<Photo[]>([]);
    const [tagsText, setTagsText] = useState('');
    const [linkedCharacterIds, setLinkedCharacterIds] = useState<string[]>([]);
    const { data: userLocation } = useGeolocation();
    
    useEffect(() => {
        if(poi) {
            setTitle(poi.title);
            setDescription(poi.description);
            setType(poi.type);
            setCategoryIds(poi.categoryIds);
            setTagsText(poi.tags?.join(', ') || '');
            setLinkedCharacterIds(poi.linkedCharacterIds);
            setExistingPhotos(poi.photos);

            // Set coordinates based on type
            if (poi.type === 'point') setCoordinates([poi.coordinates]);
            else if (poi.type === 'path') setCoordinates(poi.pathCoordinates);
            else if (poi.type === 'area') setCoordinates(poi.bounds);
            
            // Determine date mode
            const isoDate = italianDateToISODate(poi.eventDate);
            if (isoDate) {
                setDateMode('date');
                setEventDate(isoDate);
                setPeriodId(null);
            } else {
                setDateMode('period');
                setPeriodId(poi.periodId);
                setEventDate('');
            }
        }
    }, [poi]);

    const derivedLocation = useMemo(() => {
        if (coordinates.length > 0) {
            const c = coordinates[0];
            return `Lat: ${c.latitude.toFixed(4)}, Lon: ${c.longitude.toFixed(4)}`;
        }
        return 'N/A';
    }, [coordinates]);
    
    const derivedPeriodIdFromDate = useMemo(() => {
        const year = extractYear(eventDate);
        return year ? getPeriodIdFromYear(year, periods) : null;
    }, [eventDate, periods]);
    
    const handleToggleCharacter = (charId: string) => {
      setLinkedCharacterIds(prev => prev.includes(charId) ? prev.filter(id => id !== charId) : [...prev, charId]);
    };

    const handleToggleCategory = (catId: string) => {
      setCategoryIds(prev => prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            Array.from(e.target.files).forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setNewPhotos(prev => [...prev, { file, dataUrl: reader.result as string, caption: '' }]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleRemoveNewPhoto = (index: number) => {
        setNewPhotos(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleRemoveExistingPhoto = (photo: Photo) => {
        setExistingPhotos(prev => prev.filter(p => p.id !== photo.id));
        setPhotosToDelete(prev => [...prev, photo]);
    };

    const handleSubmit = () => {
        // Validation logic similar to AddPoiModal...
        const finalPeriodId = dateMode === 'date' ? derivedPeriodIdFromDate : periodId;
        if (!finalPeriodId) {
            alert("Periodo storico non valido.");
            return;
        }

        const tags = tagsText.split(',').map(t => t.trim()).filter(Boolean);
        const finalEventDate = dateMode === 'date'
            ? new Date(eventDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
            : periods.find(p => p.id === periodId)?.name || '';

        let updatedPoiData: Omit<Poi, 'id' | 'creationDate' | 'author' | 'photos'>;
        const commonData = { title, description, location: derivedLocation, eventDate: finalEventDate, periodId: finalPeriodId!, categoryIds, linkedCharacterIds, tags };

        // FIX: To resolve TypeScript errors with union types, create a typed intermediate variable
        // for each POI type before assigning to the union-typed 'updatedPoiData'. This helps
        // the compiler correctly handle properties specific to each type (e.g., 'coordinates').
        if (type === 'point') {
            const pointData: Omit<Point, 'id' | 'creationDate' | 'author' | 'photos'> = { ...commonData, type: 'point', coordinates: coordinates[0] };
            updatedPoiData = pointData;
        } else if (type === 'path') {
            const pathData: Omit<Path, 'id' | 'creationDate' | 'author' | 'photos'> = { ...commonData, type: 'path', pathCoordinates: coordinates };
            updatedPoiData = pathData;
        } else {
            const areaData: Omit<Area, 'id' | 'creationDate' | 'author' | 'photos'> = { ...commonData, type: 'area', bounds: coordinates };
            updatedPoiData = areaData;
        }

        onSave(poi.id, updatedPoiData, newPhotos.map(p => ({ file: p.file, caption: p.caption })), photosToDelete);
    };
    
    const labelStyle = "font-sans-display text-sm font-semibold text-gray-700 mb-1 block";
    const inputStyle = "w-full px-3 py-2 border border-gray-300 bg-white/50 focus:ring-1 focus:ring-[#134A79] focus:border-[#134A79] outline-none font-sans-display";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-[#FAF7F0] w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up border border-black/10 relative" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 flex items-center justify-between border-b border-gray-300/80 sticky top-0 bg-[#FAF7F0]/80 backdrop-blur-sm z-10">
                  <h2 className="font-sans-display text-2xl font-bold text-[#134A79]">Modifica Luogo</h2>
                  <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon className="w-6 h-6" /></button>
                </header>
                <div className="overflow-y-auto p-6 space-y-4">
                  <div>
                      <label htmlFor="poi-title" className={labelStyle}>Titolo *</label>
                      <input id="poi-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputStyle} required/>
                  </div>
                  {/* ... other fields like description, type, map ... */}
                  <div>
                      <label className={labelStyle}>Foto</label>
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                            {existingPhotos.map((photo) => (
                                <div key={photo.id} className="relative group border border-gray-300/80 p-1">
                                    <img src={photo.url} alt={photo.caption} className="w-full h-24 object-cover"/>
                                    <p className="w-full text-xs p-1 border-t border-gray-300/80 truncate">{photo.caption || 'Nessuna didascalia'}</p>
                                    <button onClick={() => handleRemoveExistingPhoto(photo)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <CloseIcon className="w-3 h-3"/>
                                    </button>
                                </div>
                            ))}
                            {newPhotos.map((photo, index) => (
                                <div key={index} className="relative group border border-blue-400 border-dashed p-1">
                                    <img src={photo.dataUrl} alt={`Nuova foto ${index + 1}`} className="w-full h-24 object-cover"/>
                                    <input type="text" placeholder="Didascalia..." value={photo.caption} onChange={(e) => {
                                        const newCaption = e.target.value;
                                        setNewPhotos(current => current.map((p, i) => i === index ? {...p, caption: newCaption} : p));
                                    }} className="w-full text-xs p-1 border-t border-gray-300/80" />
                                    <button onClick={() => handleRemoveNewPhoto(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <CloseIcon className="w-3 h-3"/>
                                    </button>
                                </div>
                            ))}
                           <label htmlFor="poi-photo-upload" className="cursor-pointer w-full h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 hover:border-[#134A79] hover:text-[#134A79] transition-colors">
                                <div className="text-center p-2">
                                    <CameraIcon className="w-8 h-8 mx-auto"/>
                                    <span className="text-xs font-sans-display mt-1 block">Aggiungi foto</span>
                                </div>
                            </label>
                            <input id="poi-photo-upload" type="file" multiple className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg" />
                        </div>
                  </div>
                  {/* ... other fields like tags, characters ... */}
                </div>
                <footer className="p-4 border-t border-gray-300/80 flex justify-end gap-3 sticky bottom-0 bg-[#FAF7F0]/80 backdrop-blur-sm">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 font-sans-display font-semibold hover:bg-gray-300 transition-colors rounded-md">Annulla</button>
                    <button onClick={handleSubmit} className="px-4 py-2 text-white bg-[#134A79] font-sans-display font-semibold hover:bg-[#103a60] transition-colors rounded-md">Salva Modifiche</button>
                </footer>
            </div>
        </div>
    );
};

export default EditPoiModal;