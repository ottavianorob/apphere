import React, { useState, useCallback, useRef } from 'react';
import ReactMapGL, { Marker, Source, Layer, MapRef } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import { Poi, Category, Period, Character as CharacterType, Coordinates, Point, Path, Area } from '../types';
import CloseIcon from './icons/CloseIcon';
import CategoryIcon from './icons/CategoryIcon';

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

const AddPoiModal: React.FC<AddPoiModalProps> = ({ onClose, onSave, categories, periods, characters }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [type, setType] = useState<'point' | 'path' | 'area'>('point');
    const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
    const [periodId, setPeriodId] = useState(periods[0]?.id || '');
    const [coordinates, setCoordinates] = useState<Coordinates[]>([]);
    const [photoUrl, setPhotoUrl] = useState('');
    const [photoCaption, setPhotoCaption] = useState('');
    const [tagsText, setTagsText] = useState('');
    const [linkedCharacterIds, setLinkedCharacterIds] = useState<string[]>([]);
    
    const handleToggleCharacter = (charId: string) => {
      setLinkedCharacterIds(prev =>
        prev.includes(charId) ? prev.filter(id => id !== charId) : [...prev, charId]
      );
    };

    const handleSubmit = () => {
      // Basic validation
      if (!title || !description || !location || !eventDate || !categoryId || !periodId || coordinates.length === 0) {
          alert('Per favore, compila tutti i campi obbligatori e definisci la posizione sulla mappa.');
          return;
      }
      if(type === 'point' && coordinates.length !== 1) { alert('Un "Punto" deve avere una sola coordinata.'); return; }
      if(type === 'path' && coordinates.length < 2) { alert('Un "Percorso" deve avere almeno due coordinate.'); return; }
      if(type === 'area' && coordinates.length < 3) { alert('Un\' "Area" deve avere almeno tre coordinate.'); return; }


      const tags = tagsText.split(',').map(t => t.trim()).filter(Boolean);
      const photos = photoUrl ? [{ id: `new_photo_${Date.now()}`, url: photoUrl, caption: photoCaption }] : [];
      
      let newPoi: Omit<Poi, 'id' | 'creationDate' | 'author'>;
      const commonData = { title, description, location, eventDate, periodId, categoryId, photos, linkedCharacterIds, tags };

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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="poi-location" className={labelStyle}>Luogo (es. Città) *</label>
                        <input id="poi-location" type="text" value={location} onChange={e => setLocation(e.target.value)} className={inputStyle} required/>
                    </div>
                     <div>
                        <label htmlFor="poi-date" className={labelStyle}>Data Evento *</label>
                        <input id="poi-date" type="text" value={eventDate} onChange={e => setEventDate(e.target.value)} className={inputStyle} required/>
                    </div>
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
                   <div className="grid grid-cols-1">
                      <div>
                        <label className={labelStyle}>Categoria *</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                           {categories.map(c => {
                                const colors = categoryColors[c.id] || defaultColors;
                                const isSelected = categoryId === c.id;
                                return (
                                <button
                                    key={c.id}
                                    onClick={() => setCategoryId(c.id)}
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
                     <label htmlFor="poi-period" className={labelStyle}>Periodo Storico *</label>
                     <select id="poi-period" value={periodId} onChange={e => setPeriodId(e.target.value)} className={inputStyle}>
                         {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                     </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="poi-photo-url" className={labelStyle}>URL Foto Principale</label>
                        <input id="poi-photo-url" type="url" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} className={inputStyle} placeholder="https://..."/>
                    </div>
                     <div>
                        <label htmlFor="poi-photo-caption" className={labelStyle}>Didascalia Foto</label>
                        <input id="poi-photo-caption" type="text" value={photoCaption} onChange={e => setPhotoCaption(e.target.value)} className={inputStyle} />
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