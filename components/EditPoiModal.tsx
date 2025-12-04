import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapRef } from 'react-map-gl';
import { Poi, Category, Period, Character as CharacterType, Coordinates, Photo } from '../types';
import CloseIcon from './icons/CloseIcon';
import CategoryIcon from './icons/CategoryIcon';
import CameraIcon from './icons/CameraIcon';
import MapSelector from './MapSelector';
import TrashIcon from './icons/TrashIcon';
import MapPinIcon from './icons/MapPinIcon';
import PhotoLocationModal from './PhotoLocationModal';

type NewPhoto = { type: 'file', file: File, dataUrl: string, caption: string, coordinates?: Coordinates | null } | { type: 'url', url: string, caption: string, coordinates?: Coordinates | null };

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

const italianDateToISODate = (dateString: string) => {
    const months: { [key: string]: string } = {
        'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04', 'maggio': '05', 'giugno': '06',
        'luglio': '07', 'agosto': '08', 'settembre': '09', 'ottobre': '10', 'novembre': '11', 'dicembre': '12'
    };
    const parts = dateString.split(' ');
    if (parts.length !== 3) return ''; // Fallback for invalid format
    const day = parts[0].padStart(2, '0');
    const month = months[parts[1].toLowerCase()];
    const year = parts[2];
    if (!day || !month || !year) return '';
    return `${year}-${month}-${day}`;
};

interface EditPoiModalProps {
  onClose: () => void;
  onSave: (poiId: string, poiData: Omit<Poi, 'id' | 'creationDate' | 'author' | 'photos' | 'favoriteCount' | 'isFavorited'>, photosToUpload: { file: File, caption: string, coordinates?: Coordinates | null }[], photosToDelete: Photo[], newUrlPhotos: { url: string; caption: string, coordinates?: Coordinates | null }[], updatedExistingPhotos: Photo[]) => void;
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
    const [categoryIds, setCategoryIds] = useState<string[]>([]);
    const [coordinates, setCoordinates] = useState<Coordinates[]>([]);
    const [existingPhotos, setExistingPhotos] = useState<Photo[]>([]);
    const [newPhotos, setNewPhotos] = useState<NewPhoto[]>([]);
    const [photosToDelete, setPhotosToDelete] = useState<Photo[]>([]);
    const [tagsText, setTagsText] = useState('');
    const [linkedCharacterIds, setLinkedCharacterIds] = useState<string[]>([]);
    const mapRef = useRef<MapRef>(null);

    const [addressQuery, setAddressQuery] = useState('');
    const [location, setLocation] = useState('');
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    
    const [photoInputMode, setPhotoInputMode] = useState<'upload' | 'url'>('upload');
    const [photoUrl, setPhotoUrl] = useState('');
    const [photoUrlCaption, setPhotoUrlCaption] = useState('');
    const [photoLocationModal, setPhotoLocationModal] = useState<{ photoIndex: number; isNew: boolean; initialCoordinates: Coordinates | null } | null>(null);


    const formatAddress = (address: any): string | null => {
        if (!address) return null;
        const road = address.road || '';
        const houseNumber = address.house_number || '';
        const city = address.city || address.town || address.village || '';
        const streetPart = `${road} ${houseNumber}`.trim();
        if (streetPart && city) return `${streetPart}, ${city}`;
        if (streetPart) return streetPart;
        if (city) return city;
        return null;
    };

    useEffect(() => {
        if(poi) {
            setTitle(poi.title);
            setDescription(poi.description);
            setLocation(poi.location);
            setCategoryIds(poi.categoryIds);
            setTagsText(poi.tags?.join(', ') || '');
            setLinkedCharacterIds(poi.linkedCharacterIds);
            setExistingPhotos(poi.photos);
            setAddressQuery(poi.location);
            setCoordinates([poi.coordinates]);
            
            const isoDate = italianDateToISODate(poi.eventDate);
            const firstDayOfYear = poi.eventDate.startsWith('1 Gennaio');
            
            if (isoDate && !firstDayOfYear) {
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

    useEffect(() => {
        const handler = setTimeout(() => {
            if (coordinates.length > 0) {
                const coord = coordinates[0];
                setIsFetchingLocation(true);
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coord.latitude}&lon=${coord.longitude}`)
                    .then(res => res.json())
                    .then(data => {
                        const formatted = formatAddress(data.address);
                        setLocation(formatted || data.display_name || `Coordinate: ${coord.latitude.toFixed(4)}, ${coord.longitude.toFixed(4)}`);
                    })
                    .catch(() => setLocation(`Coordinate: ${coord.latitude.toFixed(4)}, ${coord.longitude.toFixed(4)}`))
                    .finally(() => setIsFetchingLocation(false));
            } else {
                setLocation('');
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [coordinates]);
    
    const derivedPeriodIdFromDate = useCallback(
        (date: string) => {
            const year = extractYear(date);
            return year ? getPeriodIdFromYear(year, periods) : null;
        }, [periods]
    );

    const handleAddressSearch = async () => {
        if (!addressQuery.trim()) return;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newCoords = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
                mapRef.current?.flyTo({ center: [newCoords.longitude, newCoords.latitude], zoom: 16 });
                setCoordinates([newCoords]);
            } else {
                alert('Indirizzo non trovato.');
            }
        } catch (error) {
            console.error("Errore Geocoding:", error);
            alert("Errore durante la ricerca dell'indirizzo.");
        }
    };
    
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
                    setNewPhotos(prev => [...prev, { type: 'file', file, dataUrl: reader.result as string, caption: '', coordinates: null }]);
                };
                reader.readAsDataURL(file);
            });
        }
    };
    
    const handleAddUrlPhoto = () => {
        if (photoUrl.trim()) {
            try {
                new URL(photoUrl);
                setNewPhotos(prev => [...prev, { type: 'url', url: photoUrl, caption: photoUrlCaption, coordinates: null }]);
                setPhotoUrl('');
                setPhotoUrlCaption('');
            } catch (_) {
                alert('Per favore, inserisci un URL valido.');
            }
        }
    };

    const handleNewPhotoCaptionChange = (index: number, caption: string) => {
        setNewPhotos(prev => prev.map((p, i) => i === index ? { ...p, caption } : p));
    };

    const handleRemoveNewPhoto = (index: number) => {
        setNewPhotos(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleRemoveExistingPhoto = (photo: Photo) => {
        setExistingPhotos(prev => prev.filter(p => p.id !== photo.id));
        setPhotosToDelete(prev => [...prev, photo]);
    };
    
    const handleSavePhotoLocation = (newCoords: Coordinates | null) => {
        if (photoLocationModal) {
            if (photoLocationModal.isNew) {
                setNewPhotos(current => current.map((p, i) => i === photoLocationModal.photoIndex ? { ...p, coordinates: newCoords } : p));
            } else {
                setExistingPhotos(current => current.map((p, i) => i === photoLocationModal.photoIndex ? { ...p, coordinates: newCoords } : p));
            }
        }
        setPhotoLocationModal(null);
    };

    const handleSubmit = () => {
        const finalPeriodId = dateMode === 'date' ? derivedPeriodIdFromDate(eventDate) : periodId;
        if (!finalPeriodId) {
            alert("Periodo storico non valido.");
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

        const updatedPoiData: Omit<Poi, 'id' | 'creationDate' | 'author' | 'photos' | 'favoriteCount' | 'isFavorited'> = { 
            title, description, location, eventDate: finalEventDate, periodId: finalPeriodId!, categoryIds, linkedCharacterIds, tags, coordinates: coordinates[0]
        };
        
        const photosToUpload = newPhotos.filter((p): p is Extract<NewPhoto, { type: 'file' }> => p.type === 'file').map(p => ({ file: p.file, caption: p.caption, coordinates: p.coordinates }));
        const newUrlPhotos = newPhotos.filter((p): p is Extract<NewPhoto, { type: 'url' }> => p.type === 'url').map(p => ({ url: p.url, caption: p.caption, coordinates: p.coordinates }));

        onSave(poi.id, updatedPoiData, photosToUpload, photosToDelete, newUrlPhotos, existingPhotos);
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
            {photoLocationModal !== null && (
                <PhotoLocationModal 
                    onClose={() => setPhotoLocationModal(null)}
                    onSave={handleSavePhotoLocation}
                    initialCoordinates={photoLocationModal.initialCoordinates}
                />
            )}
            <div className="bg-[#FAF7F0] w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up border border-black/10 relative" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 flex items-center justify-between border-b border-gray-300/80 sticky top-0 bg-[#FAF7F0]/80 backdrop-blur-sm z-10">
                  <h2 className="font-sans-display text-2xl font-bold text-[#134A79]">Modifica Luogo</h2>
                  <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon className="w-6 h-6" /></button>
                </header>
                <div className="overflow-y-auto p-6 space-y-4">
                  <div><label htmlFor="poi-title" className={labelStyle}>Titolo *</label><input id="poi-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputStyle} required/></div>
                  <div><label htmlFor="poi-desc" className={labelStyle}>Descrizione</label><textarea id="poi-desc" value={description} onChange={e => setDescription(e.target.value)} className={`${inputStyle} h-24`} /></div>
                   <div>
                        <label htmlFor="address-search" className={labelStyle}>Cerca Indirizzo sulla Mappa</label>
                        <div className="flex gap-2"><input id="address-search" type="text" value={addressQuery} onChange={e => setAddressQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddressSearch(); } }} className={inputStyle} placeholder="Es. Via Duomo, Milano"/><button type="button" onClick={handleAddressSearch} className="px-4 py-2 text-white bg-[#134A79] font-sans-display font-semibold hover:bg-[#103a60] transition-colors rounded-md">Cerca</button></div>
                    </div>
                  <div>
                      <label className={labelStyle}>Posizione Geografica *</label>
                      <MapSelector ref={mapRef} coordinates={coordinates} setCoordinates={setCoordinates} userLocation={null} initialViewState={coordinates.length > 0 ? { longitude: coordinates[0].longitude, latitude: coordinates[0].latitude, zoom: 15 } : undefined} />
                      <p className="text-xs text-gray-500 mt-1 font-sans-display">Clicca sulla mappa per riposizionare il marcatore.</p>
                  </div>
                  <div><label className={labelStyle}>Indirizzo Rilevato</label><div className="w-full px-3 py-2 bg-gray-100 border border-gray-200 text-sm font-sans-display text-gray-600 min-h-[40px] rounded-md">{isFetchingLocation ? 'Caricamento...' : location || 'Seleziona un punto sulla mappa.'}</div></div>
                  <div>
                        <label className={labelStyle}>Data o Periodo *</label>
                        <div className="flex gap-4 font-sans-display mb-2">
                            <label className="flex items-center cursor-pointer"><input type="radio" name="date-mode" value="date" checked={dateMode === 'date'} onChange={() => setDateMode('date')} className="h-4 w-4 text-[#134A79] focus:ring-[#134A79]"/><span className="ml-2">Data Precisa</span></label>
                            <label className="flex items-center cursor-pointer"><input type="radio" name="date-mode" value="period" checked={dateMode === 'period'} onChange={() => setDateMode('period')} className="h-4 w-4 text-[#134A79] focus:ring-[#134A79]"/><span className="ml-2">Periodo Storico</span></label>
                        </div>
                        {dateMode === 'date' ? (
                            <div>
                                <input id="poi-date" type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className={inputStyle} required />
                                {derivedPeriodIdFromDate(eventDate) && <p className="text-xs text-gray-600 mt-1 font-sans-display">Periodo dedotto: <span className="font-semibold">{periods.find(p => p.id === derivedPeriodIdFromDate(eventDate))?.name}</span></p>}
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{categories.map(c => {
                                const colors = categoryColors[c.id] || defaultColors;
                                return <button key={c.id} onClick={() => handleToggleCategory(c.id)} className={`inline-flex w-full items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FAF7F0] ${categoryIds.includes(c.id) ? colors.selected : colors.unselected} ${colors.ring}`}><CategoryIcon categoryId={c.id} className="w-4 h-4" /><span>{c.name}</span></button>;
                        })}</div>
                    </div>
                  <div>
                      <label className={labelStyle}>Foto</label>
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                            {existingPhotos.map((photo, index) => (
                                <div key={photo.id} className="relative group border border-gray-300/80 p-1 flex flex-col">
                                    <img src={photo.url} alt={photo.caption} className="w-full h-24 object-cover"/>
                                    <input type="text" placeholder="Didascalia..." defaultValue={photo.caption} onChange={e => setExistingPhotos(prev => prev.map(p => p.id === photo.id ? {...p, caption: e.target.value} : p))} className="w-full text-xs p-1 border-t border-gray-300/80" />
                                    <button onClick={() => setPhotoLocationModal({ photoIndex: index, isNew: false, initialCoordinates: photo.coordinates || null })} className={`text-xs p-1 flex items-center justify-center gap-1 w-full border-t border-gray-300/80 ${photo.coordinates ? 'text-green-700' : 'text-gray-500'}`}>
                                      <MapPinIcon className="w-3 h-3" /> {photo.coordinates ? 'Posizione salvata' : 'Aggiungi posizione'}
                                    </button>
                                    <button onClick={() => handleRemoveExistingPhoto(photo)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="w-3 h-3"/></button>
                                </div>
                            ))}
                            {newPhotos.map((photo, index) => (
                                <div key={index} className="relative group border border-blue-400 border-dashed p-1 flex flex-col">
                                    <img src={photo.type === 'file' ? photo.dataUrl : photo.url} alt={`Nuova foto ${index + 1}`} className="w-full h-24 object-cover"/>
                                    <input type="text" placeholder="Didascalia..." value={photo.caption} onChange={(e) => handleNewPhotoCaptionChange(index, e.target.value)} className="w-full text-xs p-1 border-t border-gray-300/80" />
                                    <button onClick={() => setPhotoLocationModal({ photoIndex: index, isNew: true, initialCoordinates: photo.coordinates || null })} className={`text-xs p-1 flex items-center justify-center gap-1 w-full border-t border-gray-300/80 ${photo.coordinates ? 'text-green-700' : 'text-gray-500'}`}>
                                      <MapPinIcon className="w-3 h-3" /> {photo.coordinates ? 'Posizione salvata' : 'Aggiungi posizione'}
                                    </button>
                                    <button onClick={() => handleRemoveNewPhoto(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><CloseIcon className="w-3 h-3"/></button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <div className="flex border-b border-gray-300 mb-2">
                                <button onClick={() => setPhotoInputMode('upload')} className={`px-4 py-2 text-sm font-sans-display font-semibold ${photoInputMode === 'upload' ? 'border-b-2 border-[#134A79] text-[#134A79]' : 'text-gray-500'}`}>Upload File</button>
                                <button onClick={() => setPhotoInputMode('url')} className={`px-4 py-2 text-sm font-sans-display font-semibold ${photoInputMode === 'url' ? 'border-b-2 border-[#134A79] text-[#134A79]' : 'text-gray-500'}`}>Da URL</button>
                            </div>

                            {photoInputMode === 'upload' ? (
                                <>
                                <label htmlFor="poi-photo-upload" className="cursor-pointer mt-2 w-full h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 hover:border-[#134A79] hover:text-[#134A79] transition-colors">
                                    <div className="text-center p-2"><CameraIcon className="w-8 h-8 mx-auto"/><span className="text-xs font-sans-display mt-1 block">Aggiungi foto</span></div>
                                </label>
                                <input id="poi-photo-upload" type="file" multiple className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg" />
                                </>
                            ) : (
                                <div className="space-y-2 p-2 border border-dashed border-gray-300 rounded-md mt-2">
                                    <input type="url" placeholder="Incolla URL immagine" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} className={inputStyle} />
                                    <input type="text" placeholder="Didascalia (opzionale)" value={photoUrlCaption} onChange={e => setPhotoUrlCaption(e.target.value)} className={inputStyle} />
                                    <button type="button" onClick={handleAddUrlPhoto} className="px-3 py-1 text-sm bg-[#134A79] text-white rounded-md font-sans-display">Aggiungi Foto da URL</button>
                                </div>
                            )}
                        </div>
                  </div>
                  <div><label htmlFor="poi-tags" className={labelStyle}>Tags</label><input id="poi-tags" type="text" value={tagsText} onChange={e => setTagsText(e.target.value)} className={inputStyle} placeholder="es. storia, milano, ..."/><p className="text-xs text-gray-500 mt-1 font-sans-display">Separa i tag con una virgola.</p></div>
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
                    <button onClick={handleSubmit} className="px-4 py-2 text-white bg-[#134A79] font-sans-display font-semibold hover:bg-[#103a60] transition-colors rounded-md">Salva Modifiche</button>
                </footer>
            </div>
             <style>{`@keyframes fade-in{from{opacity:0}to{opacity:1}}.animate-fade-in{animation:fade-in .3s ease-out forwards}@keyframes slide-up{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}.animate-slide-up{animation:slide-up .3s ease-out forwards}`}</style>
        </div>
    );
};

export default EditPoiModal;