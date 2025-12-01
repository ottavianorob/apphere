import React, { useState, useCallback, useRef, useMemo } from 'react';
import ReactMapGL, { Marker, Source, Layer, MapRef } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import { Poi, Category, Period, Character as CharacterType, Coordinates, Point, Path, Area } from '../types';
import CloseIcon from './icons/CloseIcon';
import CategoryIcon from './icons/CategoryIcon';
import CameraIcon from './icons/CameraIcon';

// Fix for cross-origin error in sandboxed environments by setting worker URL
(maplibregl as any).workerURL = "https://aistudiocdn.com/maplibre-gl@^4.3.2/dist/maplibre-gl-csp-worker.js";


interface MapSelectorProps {
  type: 'point' | 'path' | 'area';
  coordinates: Coordinates[];
  setCoordinates: React.Dispatch<React.SetStateAction<Coordinates[]>>;
}

const MapSelector: React.FC<MapSelectorProps> = ({ type, coordinates, setCoordinates }) => {
  const mapRef = useRef<MapRef>(null);
  const MAPTILER_KEY = 'FyvyDlvVMDaQNPtxRXIa';

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
    <div className="h-64 w-full rounded-lg overflow-hidden relative border border-gray-300/80">
      <ReactMapGL
        ref={mapRef}
        onLoad={() => {
          setTimeout(() => {
            mapRef.current?.getMap().resize();
          }, 100);
        }}
        initialViewState={{ longitude: 9.189982, latitude: 45.464204, zoom: 12 }}
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
  onSave: (poi: Omit<Poi, 'id' | 'creationDate' | 'author'>) => void;
  categories: Category[];
  periods: Period[];
  characters: CharacterType[];
}

const getPeriodIdFromYear = (year: number): string | null => {
    if (year <= 1870) return 'risorgimento';
    if (year >= 1871 && year <= 1914) return 'belleepoque';
    if (year >= 1919 && year <= 1922) return 'primog dopoguerra';
    if (year >= 1943 && year <= 1945) return 'resistenza';
    if (year >= 1946 && year <= 1959) return 'boom';
    if (year >= 1960 && year <= 1969) return 'anni60';
    if (year >= 1970 && year <= 1989) return 'anni70';
    if (year >= 1990 && year <= 1999) return 'anni90';
    return null;
};

const extractYear = (dateString: string): number | null => {
    const match = dateString.match(/\b\d{4}\b/g);
    if (match) {
        return parseInt(match[match.length - 1], 10);
    }
    return null;
};

const AddPoiModal: React.FC<AddPoiModalProps> = ({ onClose, onSave, categories, periods, characters }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [type, setType] = useState<'point' | 'path' | 'area'>('point');
    const [categoryIds, setCategoryIds] = useState<string[]>([]);
    const [coordinates, setCoordinates] = useState<Coordinates[]>([]);
    const [photoDataUrl, setPhotoDataUrl] = useState('');
    const [photoCaption, setPhotoCaption] = useState('');
    const [tagsText, setTagsText] = useState('');
    const [linkedCharacterIds, setLinkedCharacterIds] = useState<string[]>([]);

    const derivedLocation = useMemo(() => {
        if (coordinates.length > 0) {
            const c = coordinates[0];
            return `Lat: ${c.latitude.toFixed(4)}, Lon: ${c.longitude.toFixed(4)}`;
        }
        return 'Seleziona un punto sulla mappa';
    }, [coordinates]);
    
    const derivedPeriodId = useMemo(() => {
        const year = extractYear(eventDate);
        return year ? getPeriodIdFromYear(year) : null;
    }, [eventDate]);

    const derivedPeriod = useMemo(() => {
        return derivedPeriodId ? periods.find(p => p.id === derivedPeriodId) : null;
    }, [derivedPeriodId, periods]);
    
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
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert('Il file è troppo grande. La dimensione massima è 2MB.');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoDataUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPhotoDataUrl('');
      }
    };

    const handleSubmit = () => {
      if (!title || !description || !eventDate || categoryIds.length === 0 || coordinates.length === 0 || !derivedPeriodId) {
          alert('Per favore, compila tutti i campi obbligatori (*).');
          return;
      }
      if(type === 'point' && coordinates.length !== 1) { alert('Un "Punto" deve avere una sola coordinata.'); return; }
      if(type === 'path' && coordinates.length < 2) { alert('Un "Percorso" deve avere almeno due coordinate.'); return; }
      if(type === 'area' && coordinates.length < 3) { alert('Un\' "Area" deve avere almeno tre coordinate.'); return; }

      const tags = tagsText.split(',').map(t => t.trim()).filter(Boolean);
      const photos = photoDataUrl ? [{ id: `new_photo_${Date.now()}`, url: photoDataUrl, caption: photoCaption }] : [];
      
      let newPoi: Omit<Poi, 'id' | 'creationDate' | 'author'>;
      const commonData = { title, description, location: derivedLocation, eventDate, periodId: derivedPeriodId, categoryIds, photos, linkedCharacterIds, tags };

      if (type === 'point') {
        const pointPoi: Omit<Point, 'id' | 'creationDate' | 'author'> = { ...commonData, type: 'point', coordinates: coordinates[0] };
        newPoi = pointPoi;
      } else if (type === 'path') {
        const pathPoi: Omit<Path, 'id' | 'creationDate' | 'author'> = { ...commonData, type: 'path', pathCoordinates: coordinates };
        newPoi = pathPoi;
      } else { // area
        const areaPoi: Omit<Area, 'id' | 'creationDate' | 'author'> = { ...commonData, type: 'area', bounds: coordinates };
        newPoi = areaPoi;
      }
      
      onSave(newPoi);
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
                      <label htmlFor="poi-desc" className={labelStyle}>Descrizione *</label>
                      <textarea id="poi-desc" value={description} onChange={e => setDescription(e.target.value)} className={`${inputStyle} h-24`} required/>
                  </div>
                  <div>
                      <label className={labelStyle}>Tipologia *</label>
                      <div className="flex gap-4 font-sans-display">
                          {(['point', 'path', 'area'] as const).map(t => (
                              <label key={t} className="flex items-center cursor-pointer">
                                <input type="radio" name="poi-type" value={t} checked={type === t} onChange={() => { setType(t); setCoordinates([]); }} className="h-4 w-4"/>
                                <span className="ml-2 capitalize">{t === 'point' ? 'Punto' : t}</span>
                              </label>
                          ))}
                      </div>
                  </div>
                  <div>
                      <label className={labelStyle}>Posizione Geografica *</label>
                      <p className="text-xs text-gray-500 mt-1 mb-2 font-sans-display">Fai clic sulla mappa per definire la posizione. Per Percorsi e Aree, fai clic più volte.</p>
                      <MapSelector type={type} coordinates={coordinates} setCoordinates={setCoordinates} />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => setCoordinates(c => c.slice(0, -1))} className="text-xs font-sans-display px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-md">Annulla ultimo punto</button>
                        <button onClick={() => setCoordinates([])} className="text-xs font-sans-display px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-md">Pulisci</button>
                      </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="poi-location" className={labelStyle}>Luogo (automatico) *</label>
                        <input id="poi-location" type="text" value={derivedLocation} className={`${inputStyle} bg-gray-100/50`} disabled readOnly/>
                    </div>
                     <div>
                        <label htmlFor="poi-date" className={labelStyle}>Data Evento *</label>
                        <input id="poi-date" type="text" value={eventDate} onChange={e => setEventDate(e.target.value)} className={inputStyle} required placeholder="Es. 28 aprile 1945"/>
                    </div>
                  </div>
                  <div className="grid grid-cols-1">
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
                  </div>
                  <div>
                     <label className={labelStyle}>Periodo Storico (automatico) *</label>
                     <div className="w-full px-3 py-2 border border-gray-300 bg-gray-100/50 min-h-[42px] flex items-center font-sans-display">
                        {derivedPeriod ? derivedPeriod.name : <span className="text-gray-500">Inserisci una data valida per l'evento</span>}
                    </div>
                  </div>
                  <div>
                      <label className={labelStyle}>Foto Principale</label>
                      <div className="mt-1 flex items-start gap-4">
                          <div className="w-32 flex-shrink-0">
                              <label htmlFor="poi-photo-upload" className="cursor-pointer block w-full h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 hover:border-[#134A79] hover:text-[#134A79] transition-colors overflow-hidden">
                                  {photoDataUrl ? (
                                      <img src={photoDataUrl} alt="Anteprima" className="w-full h-full object-cover"/>
                                  ) : (
                                      <div className="text-center p-2">
                                          <CameraIcon className="w-8 h-8 mx-auto"/>
                                          <span className="text-xs font-sans-display mt-1 block">Carica foto</span>
                                      </div>
                                  )}
                              </label>
                              <input id="poi-photo-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg" />
                          </div>
                          <div className="flex-grow">
                              <label htmlFor="poi-photo-caption" className={labelStyle}>Didascalia Foto</label>
                              <input id="poi-photo-caption" type="text" value={photoCaption} onChange={e => setPhotoCaption(e.target.value)} className={inputStyle} />
                               {photoDataUrl && (
                                   <button onClick={() => {
                                       const input = document.getElementById('poi-photo-upload') as HTMLInputElement;
                                       if(input) input.value = '';
                                       setPhotoDataUrl('');
                                   }} className="mt-2 text-xs text-red-600 hover:underline font-sans-display">Rimuovi immagine</button>
                              )}
                          </div>
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
                                  <img src={char.photos[0]?.url || 'https://picsum.photos/seed/placeholder/100/100'} alt={char.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
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