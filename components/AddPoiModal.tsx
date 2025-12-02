import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import ReactMapGL, { Marker, Source, Layer, MapRef } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import { Poi, Category, Period, Character as CharacterType, Coordinates, Point, Path, Area } from '../types';
import CloseIcon from './icons/CloseIcon';
import CategoryIcon from './icons/CategoryIcon';
import CameraIcon from './icons/CameraIcon';
import useGeolocation from '../hooks/useGeolocation';
import TrashIcon from './icons/TrashIcon';

// Fix for cross-origin error in sandboxed environments by setting worker URL
(maplibregl as any).workerURL = "https://aistudiocdn.com/maplibre-gl@^4.3.2/dist/maplibre-gl-csp-worker.js";

type PhotoUpload = {
    file: File;
    dataUrl: string;
    caption: string;
};

interface MapSelectorProps {
  type: 'point' | 'path' | 'area';
  coordinates: Coordinates[];
  setCoordinates: React.Dispatch<React.SetStateAction<Coordinates[]>>;
  userLocation: Coordinates | null;
}

const MapSelector: React.FC<MapSelectorProps> = ({ type, coordinates, setCoordinates, userLocation }) => {
  const mapRef = useRef<MapRef>(null);
  const MAPTILER_KEY = 'FyvyDlvVMDaQNPtxRXIa';
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [viewState, setViewState] = useState({
    longitude: userLocation?.longitude || 9.189982,
    latitude: userLocation?.latitude || 45.464204,
    zoom: userLocation ? 15 : 12,
  });

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
    if (userLocation && mapRef.current) {
        mapRef.current.flyTo({
            center: [userLocation.longitude, userLocation.latitude],
            zoom: 15,
            duration: 1500,
        });
    }
  }, [userLocation]);

  const handleClick = useCallback((event: maplibregl.MapLayerMouseEvent) => {
    const { lng, lat } = event.lngLat;
    const newCoord = { latitude: lat, longitude: lng };

    if (type === 'point') {
      setCoordinates([newCoord]);
    } else {
      setCoordinates(prev => [...prev, newCoord]);
    }
  }, [type, setCoordinates]);

  const pathGeoJSON: any = { type: 'Feature', geometry: { type: 'LineString', coordinates: coordinates.map(c => [c.longitude, c.latitude]) } };
  const areaGeoJSON: any = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coordinates.map(c => [c.longitude, c.latitude])] }};

  return (
    <div ref={mapContainerRef} className="h-64 w-full rounded-lg overflow-hidden relative border border-gray-300/80">
      <ReactMapGL
        mapLib={maplibregl}
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={`https://api.maptiler.com/maps/0197890d-f9ac-7f85-b738-4eecc9189544/style.json?key=${MAPTILER_KEY}`}
        onClick={handleClick}
        cursor="crosshair"
      >
        {coordinates.map((coord, index) => (
          <Marker key={index} longitude={coord.longitude} latitude={coord.latitude} anchor="center">
            <div className="w-3 h-3 bg-red-600 rounded-full border-2 border-white" />
          </Marker>
        ))}
        {type === 'path' && coordinates.length > 1 && (
          <Source id="path-preview" type="geojson" data={pathGeoJSON}>
            <Layer id="path-preview-layer" type="line" paint={{ 'line-color': '#B1352E', 'line-width': 3, 'line-dasharray': [2, 2] }} />
          </Source>
        )}
        {type === 'area' && coordinates.length > 2 && (
           <Source id="area-preview" type="geojson" data={areaGeoJSON}>
            <Layer id="area-preview-layer" type="fill" paint={{ 'fill-color': '#134A79', 'fill-opacity': 0.3, 'fill-outline-color': '#134A79' }} />
          </Source>
        )}
      </ReactMapGL>
    </div>
  );
};


interface AddPoiModalProps {
  onClose: () => void;
  onSave: (poiData: Omit<Poi, 'id' | 'creationDate' | 'author' | 'photos'>, photosToUpload: { file: File, caption: string }[]) => void;
  categories: Category[];
  periods: Period[];
  characters: CharacterType[];
}

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

const AddPoiModal: React.FC<AddPoiModalProps> = ({ onClose, onSave, categories, periods, characters }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dateMode, setDateMode] = useState<'date' | 'period'>('date');
    const [eventDate, setEventDate] = useState('');
    const [periodId, setPeriodId] = useState<string | null>(null);
    const [type, setType] = useState<'point' | 'path' | 'area'>('point');
    const [categoryIds, setCategoryIds] = useState<string[]>([]);
    const [coordinates, setCoordinates] = useState<Coordinates[]>([]);
    const [photos, setPhotos] = useState<PhotoUpload[]>([]);
    const [tagsText, setTagsText] = useState('');
    const [linkedCharacterIds, setLinkedCharacterIds] = useState<string[]>([]);
    const { data: userLocation } = useGeolocation();

    useEffect(() => {
        if (type === 'point' && userLocation && coordinates.length === 0) {
            setCoordinates([{ latitude: userLocation.latitude, longitude: userLocation.longitude }]);
        }
    }, [type, userLocation, coordinates.length]);

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
      setLinkedCharacterIds(prev =>
        prev.includes(charId) ? prev.filter(id => id !== charId) : [...prev, charId]
      );
    };

    const handleToggleCategory = (catId: string) => {
      setCategoryIds(prev =>
        prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
      );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                if (file.size > 2 * 1024 * 1024) { // 2MB limit
                    alert(`Il file ${file.name} è troppo grande. La dimensione massima è 2MB.`);
                    return;
                }
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPhotos(prev => [...prev, { file, dataUrl: reader.result as string, caption: '' }]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handlePhotoCaptionChange = (index: number, caption: string) => {
        setPhotos(prev => prev.map((p, i) => i === index ? { ...p, caption } : p));
    };

    const handleRemovePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
      const errors: string[] = [];
      if (!title.trim()) errors.push("Il titolo è obbligatorio.");
      if (dateMode === 'date' && !eventDate) errors.push("La data precisa dell'evento è obbligatoria.");
      if (dateMode === 'period' && !periodId) errors.push("È obbligatorio selezionare un periodo storico.");
      if (categoryIds.length === 0) errors.push("Seleziona almeno una categoria.");
      if (coordinates.length === 0) errors.push("Indica la posizione sulla mappa.");
      if (type === 'point' && coordinates.length !== 1) errors.push('Un "Punto" deve avere una sola coordinata.');
      if (type === 'path' && coordinates.length < 2) errors.push('Un "Percorso" deve avere almeno due coordinate.');
      if (type === 'area' && coordinates.length < 3) errors.push('Un\' "Area" deve avere almeno tre coordinate.');
      
      const finalPeriodId = dateMode === 'date' ? derivedPeriodIdFromDate : periodId;
      if (!finalPeriodId) {
        errors.push("Non è stato possibile determinare un periodo storico. Seleziona una data valida o un periodo dall'elenco.");
      }

      if (errors.length > 0) {
          alert(`Per favore, correggi i seguenti errori:\n\n- ${errors.join('\n- ')}`);
          return;
      }

      const tags = tagsText.split(',').map(t => t.trim()).filter(Boolean);
      
      let finalEventDate: string;
      if (dateMode === 'date') {
        const dateParts = eventDate.split('-');
        finalEventDate = new Date(Date.UTC(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]))).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
      } else {
        const selectedPeriod = periods.find(p => p.id === periodId);
        finalEventDate = selectedPeriod ? `1 Gennaio ${selectedPeriod.start_year}` : '';
      }

      let newPoiData: Omit<Poi, 'id' | 'creationDate' | 'author' | 'photos'>;
      const commonData = { title, description, location: derivedLocation, eventDate: finalEventDate, periodId: finalPeriodId!, categoryIds, linkedCharacterIds, tags };

      if (type === 'point') {
        const pointData: Omit<Point, 'id' | 'creationDate' | 'author' | 'photos'> = { ...commonData, type: 'point', coordinates: coordinates[0] };
        newPoiData = pointData;
      } else if (type === 'path') {
        const pathData: Omit<Path, 'id' | 'creationDate' | 'author' | 'photos'> = { ...commonData, type: 'path', pathCoordinates: coordinates };
        newPoiData = pathData;
      } else { // area
        const areaData: Omit<Area, 'id' | 'creationDate' | 'author' | 'photos'> = { ...commonData, type: 'area', bounds: coordinates };
        newPoiData = areaData;
      }
      
      onSave(newPoiData, photos.map(p => ({ file: p.file, caption: p.caption })));
    };
    
    const labelStyle = "font-sans-display text-sm font-semibold text-gray-700 mb-1 block";
    const inputStyle = "w-full px-3 py-2 border border-gray-300 bg-white/50 focus:ring-1 focus:ring-[#134A79] focus:border-[#134A79] outline-none font-sans-display";
    
    const categoryColors: { [key: string]: { selected: string; unselected: string; ring: string; } } = {
        'storia':   { selected: 'bg-sky-700 text-white', unselected: 'text-sky-700 border border-sky-700 bg-transparent', ring: 'focus:ring-sky-500' },
        'arte':     { selected: 'bg-amber-600 text-white', unselected: 'text-amber-600 border border-amber-600 bg-transparent', ring: 'focus:ring-amber-500' },
        'societa':  { selected: 'bg-red-700 text-white', unselected: 'text-red-700 border border-red-700 bg-transparent', ring: 'focus:ring-red-500' },
        'cinema':   { selected: 'bg-emerald-600 text-white', unselected: 'text-emerald-600 border border-emerald-600 bg-transparent', ring: 'focus:ring-emerald-500' },
        'musica':   { selected: 'bg-indigo-600 text-white', unselected: 'text-indigo-600 border border-indigo-600 bg-transparent', ring: 'focus:ring-indigo-500' },
    };
    const defaultColors = { selected: 'bg-gray-600 text-white', unselected: 'text-gray-600 border border-gray-600 bg-transparent', ring: 'focus:ring-gray-500' };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-[#FAF7F0] w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up border border-black/10 relative" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 flex items-center justify-between border-b border-gray-300/80 sticky top-0 bg-[#FAF7F0]/80 backdrop-blur-sm z-10">
                  <h2 className="font-sans-display text-2xl font-bold text-[#134A79]">Aggiungi nuovo Luogo</h2>
                  <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon className="w-6 h-6" /></button>
                </header>
                <div className="overflow-y-auto p-6 space-y-4">
                  <div>
                      <label htmlFor="poi-title" className={labelStyle}>Titolo *</label>
                      <input id="poi-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputStyle} required/>
                  </div>
                   <div>
                      <label htmlFor="poi-desc" className={labelStyle}>Descrizione</label>
                      <textarea id="poi-desc" value={description} onChange={e => setDescription(e.target.value)} className={`${inputStyle} h-24`} />
                  </div>
                  <div>
                      <label className={labelStyle}>Tipologia *</label>
                      <div className="flex gap-4 font-sans-display">
                          {(['point', 'path', 'area'] as const).map(t => (
                              <label key={t} className="flex items-center cursor-pointer">
                                <input type="radio" name="poi-type" value={t} checked={type === t} onChange={() => { setType(t); setCoordinates([]); }} className="h-4 w-4 text-[#134A79] focus:ring-[#134A79]"/>
                                <span className="ml-2 capitalize">{t === 'point' ? 'Punto' : t}</span>
                              </label>
                          ))}
                      </div>
                  </div>
                  <div>
                      <label className={labelStyle}>Posizione Geografica *</label>
                      <p className="text-xs text-gray-500 mt-1 mb-2 font-sans-display">
                        {type === 'point' 
                          ? 'La posizione è impostata sulla tua posizione attuale. Clicca sulla mappa per modificarla.' 
                          : 'Fai clic sulla mappa per definire i punti. Per Percorsi e Aree, fai clic più volte.'}
                      </p>
                      <MapSelector type={type} coordinates={coordinates} setCoordinates={setCoordinates} userLocation={userLocation} />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => setCoordinates(c => c.slice(0, -1))} className="text-xs font-sans-display px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-md">Annulla ultimo punto</button>
                        <button onClick={() => setCoordinates([])} className="text-xs font-sans-display px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-md">Pulisci</button>
                      </div>
                  </div>
                   <div>
                        <label className={labelStyle}>Data o Periodo *</label>
                        <div className="flex gap-4 font-sans-display mb-2">
                            <label className="flex items-center cursor-pointer">
                                <input type="radio" name="date-mode" value="date" checked={dateMode === 'date'} onChange={() => setDateMode('date')} className="h-4 w-4 text-[#134A79] focus:ring-[#134A79]"/>
                                <span className="ml-2">Data Precisa</span>
                            </label>
                             <label className="flex items-center cursor-pointer">
                                <input type="radio" name="date-mode" value="period" checked={dateMode === 'period'} onChange={() => setDateMode('period')} className="h-4 w-4 text-[#134A79] focus:ring-[#134A79]"/>
                                <span className="ml-2">Periodo Storico</span>
                            </label>
                        </div>
                        {dateMode === 'date' ? (
                            <div>
                                <input id="poi-date" type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className={inputStyle} required />
                                {derivedPeriodIdFromDate && <p className="text-xs text-gray-600 mt-1 font-sans-display">Periodo dedotto: <span className="font-semibold">{periods.find(p => p.id === derivedPeriodIdFromDate)?.name}</span></p>}
                            </div>
                        ) : (
                            <select id="poi-period" value={periodId || ''} onChange={e => setPeriodId(e.target.value)} className={inputStyle} required>
                                <option value="" disabled>Seleziona un periodo...</option>
                                {periods.map(p => <option key={p.id} value={p.id}>{p.name} ({p.start_year}-{p.end_year})</option>)}
                            </select>
                        )}
                    </div>
                  <div>
                        <label className={labelStyle}>Categoria/e *</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                           {categories.map(c => {
                                const colors = categoryColors[c.id] || defaultColors;
                                const isSelected = categoryIds.includes(c.id);
                                return (
                                <button
                                    key={c.id}
                                    onClick={() => handleToggleCategory(c.id)}
                                    className={`inline-flex w-full items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FAF7F0] ${isSelected ? colors.selected : colors.unselected} ${colors.ring}`}
                                >
                                    <CategoryIcon categoryId={c.id} className="w-4 h-4" />
                                    <span>{c.name}</span>
                                </button>
                                );
                           })}
                        </div>
                    </div>
                  <div>
                      <label className={labelStyle}>Foto</label>
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                            {photos.map((photo, index) => (
                                <div key={index} className="relative group border border-gray-300/80 p-1">
                                    <img src={photo.dataUrl} alt={`Anteprima ${index + 1}`} className="w-full h-24 object-cover"/>
                                    <input type="text" placeholder="Didascalia..." value={photo.caption} onChange={(e) => handlePhotoCaptionChange(index, e.target.value)} className="w-full text-xs p-1 border-t border-gray-300/80" />
                                    <button onClick={() => handleRemovePhoto(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
                   <div>
                      <label htmlFor="poi-tags" className={labelStyle}>Tags</label>
                      <input id="poi-tags" type="text" value={tagsText} onChange={e => setTagsText(e.target.value)} className={inputStyle} placeholder="es. storia, milano, ..."/>
                      <p className="text-xs text-gray-500 mt-1 font-sans-display">Separa i tag con una virgola.</p>
                  </div>
                   <div>
                      <label className={labelStyle}>Personaggi Collegati</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {characters.map(char => (
                              <button key={char.id} onClick={() => handleToggleCharacter(char.id)} className={`p-2 text-left rounded-md flex items-center gap-2 transition-colors border ${linkedCharacterIds.includes(char.id) ? 'bg-[#134A79]/20 border-[#134A79]' : 'bg-white/50 border-gray-300/80 hover:bg-gray-200/50'}`}>
                                  <img src={char.photos[0]?.url || 'https://placehold.co/100x100'} alt={char.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                  <span className="text-sm font-sans-display font-semibold text-gray-800">{char.name}</span>
                              </button>
                          ))}
                      </div>
                  </div>
                </div>
                <footer className="p-4 border-t border-gray-300/80 flex justify-end gap-3 sticky bottom-0 bg-[#FAF7F0]/80 backdrop-blur-sm">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 font-sans-display font-semibold hover:bg-gray-300 transition-colors rounded-md">Annulla</button>
                    <button onClick={handleSubmit} className="px-4 py-2 text-white bg-[#134A79] font-sans-display font-semibold hover:bg-[#103a60] transition-colors rounded-md">Salva Luogo</button>
                </footer>
            </div>
            <style>{`@keyframes fade-in{from{opacity:0}to{opacity:1}}.animate-fade-in{animation:fade-in .3s ease-out forwards}@keyframes slide-up{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}.animate-slide-up{animation:slide-up .3s ease-out forwards}`}</style>
        </div>
    );
};

export default AddPoiModal;