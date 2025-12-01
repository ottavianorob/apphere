import React, { useState, useMemo } from 'react';
import { Itinerary, Poi, Photo } from '../types';
import CloseIcon from './icons/CloseIcon';
import CameraIcon from './icons/CameraIcon';

interface AddItineraryModalProps {
  onClose: () => void;
  onSave: (itinerary: Omit<Itinerary, 'id' | 'author'>) => void;
  allPois: Poi[];
}

const AddItineraryModal: React.FC<AddItineraryModalProps> = ({ onClose, onSave, allPois }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [coverPhotoDataUrl, setCoverPhotoDataUrl] = useState('');
    const [tagsText, setTagsText] = useState('');
    const [selectedPois, setSelectedPois] = useState<Poi[]>([]);
    const [draggedItem, setDraggedItem] = useState<Poi | null>(null);

    const availablePois = useMemo(() => {
        const selectedIds = new Set(selectedPois.map(p => p.id));
        // FIX: Correctly check for poi.id in the set.
        return allPois.filter(p => !selectedIds.has(p.id));
    }, [allPois, selectedPois]);

    const estimatedDuration = useMemo(() => {
      const numStops = selectedPois.length;
      if (numStops === 0) return 'N/A';
      const timeAtStops = numStops * 20; // 20 mins per stop
      const travelTime = (numStops > 1 ? (numStops - 1) * 15 : 0); // 15 mins travel between stops
      const totalMinutes = timeAtStops + travelTime;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      let durationString = '~';
      if (hours > 0) durationString += ` ${hours} ore`;
      if (minutes > 0) durationString += ` ${minutes} min`;
      return durationString.trim();
    }, [selectedPois]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert('Il file è troppo grande. La dimensione massima è 2MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPhotoDataUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setCoverPhotoDataUrl('');
        }
    };

    const handleAddPoi = (poi: Poi) => {
        setSelectedPois(prev => [...prev, poi]);
    };
    
    const handleRemovePoi = (poiId: string) => {
        setSelectedPois(prev => prev.filter(p => p.id !== poiId));
    }

    const onDragStart = (e: React.DragEvent<HTMLDivElement>, item: Poi) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        if (!draggedItem) return;

        const draggedOverItem = selectedPois[index];
        if (draggedItem.id === draggedOverItem.id) return;

        let items = selectedPois.filter(item => item.id !== draggedItem.id);
        items.splice(index, 0, draggedItem);
        setSelectedPois(items);
    };

    const onDragEnd = () => {
        setDraggedItem(null);
    };

    const handleSubmit = () => {
        const errors: string[] = [];
        if (!title.trim()) errors.push("Il titolo è obbligatorio.");
        if (!description.trim()) errors.push("La descrizione è obbligatoria.");
        if (!coverPhotoDataUrl) errors.push("Carica una foto di copertina.");
        if (selectedPois.length === 0) errors.push("Aggiungi almeno una tappa all'itinerario.");

        if (errors.length > 0) {
            alert(`Per favore, correggi i seguenti errori:\n\n- ${errors.join('\n- ')}`);
            return;
        }

        const tags = tagsText.split(',').map(t => t.trim()).filter(Boolean);
        const coverPhoto: Photo = {
            id: `new_cover_${Date.now()}`,
            url: coverPhotoDataUrl,
            caption: `Copertina per ${title}`
        };

        const newItinerary: Omit<Itinerary, 'id' | 'author'> = {
            title,
            description,
            estimatedDuration,
            poiIds: selectedPois.map(p => p.id),
            tags,
            coverPhoto
        };
        
        onSave(newItinerary);
    };
    
    const labelStyle = "font-sans-display text-sm font-semibold text-gray-700 mb-1 block";
    const inputStyle = "w-full px-3 py-2 border border-gray-300 bg-white/50 focus:ring-1 focus:ring-[#134A79] focus:border-[#134A79] outline-none font-sans-display";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-[#FAF7F0] w-full max-w-3xl max-h-[90vh] flex flex-col animate-slide-up border border-black/10 relative" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 flex items-center justify-between border-b border-gray-300/80 sticky top-0 bg-[#FAF7F0]/80 backdrop-blur-sm z-10">
                  <h2 className="font-sans-display text-2xl font-bold text-[#134A79]">Aggiungi nuovo Itinerario</h2>
                  <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon className="w-6 h-6" /></button>
                </header>
                <div className="overflow-y-auto p-6 space-y-4">
                  <div>
                      <label htmlFor="it-title" className={labelStyle}>Titolo *</label>
                      <input id="it-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputStyle} required/>
                  </div>
                   <div>
                      <label htmlFor="it-desc" className={labelStyle}>Descrizione *</label>
                      <textarea id="it-desc" value={description} onChange={e => setDescription(e.target.value)} className={`${inputStyle} h-24`} required/>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label className={labelStyle}>Durata Stimata</label>
                        <p className="font-sans-display font-bold text-lg text-[#134A79] h-10 flex items-center">{estimatedDuration}</p>
                    </div>
                    <div>
                        <label className={labelStyle}>Foto Copertina *</label>
                        <div className="mt-1">
                            <label htmlFor="it-cover-upload" className="cursor-pointer block w-full h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 hover:border-[#134A79] hover:text-[#134A79] transition-colors overflow-hidden">
                                {coverPhotoDataUrl ? (
                                    <img src={coverPhotoDataUrl} alt="Anteprima" className="w-full h-full object-cover"/>
                                ) : (
                                    <div className="text-center">
                                        <CameraIcon className="w-8 h-8 mx-auto"/>
                                        <span className="text-xs font-sans-display mt-1 block">Carica una foto</span>
                                    </div>
                                )}
                            </label>
                            <input id="it-cover-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg" />
                        </div>
                        {coverPhotoDataUrl && (
                            <button onClick={() => {
                                const input = document.getElementById('it-cover-upload') as HTMLInputElement;
                                if(input) input.value = '';
                                setCoverPhotoDataUrl('');
                            }} className="mt-2 text-xs text-red-600 hover:underline font-sans-display">Rimuovi immagine</button>
                        )}
                    </div>
                  </div>
                  <div>
                      <label htmlFor="it-tags" className={labelStyle}>Tags</label>
                      <input id="it-tags" type="text" value={tagsText} onChange={e => setTagsText(e.target.value)} className={inputStyle} placeholder="es. storia, milano, ..."/>
                      <p className="text-xs text-gray-500 mt-1 font-sans-display">Separa i tag con una virgola.</p>
                  </div>
                   <div>
                      <label className={labelStyle}>Tappe dell'itinerario *</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Available POIs */}
                        <div className="border border-gray-300 p-2 rounded-md">
                            <h4 className="font-sans-display font-semibold text-center mb-2">Luoghi disponibili</h4>
                            <div className="max-h-48 overflow-y-auto space-y-1">
                                {availablePois.map(poi => (
                                    <div key={poi.id} className="flex items-center justify-between p-1 rounded-md bg-white/80">
                                        <span className="text-sm font-sans-display">{poi.title}</span>
                                        <button onClick={() => handleAddPoi(poi)} className="text-xs bg-green-200 text-green-800 rounded-full w-5 h-5 flex items-center justify-center font-bold hover:bg-green-300">+</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Selected POIs */}
                         <div className="border border-gray-300 p-2 rounded-md">
                            <h4 className="font-sans-display font-semibold text-center mb-2">Tappe selezionate</h4>
                            <div className="max-h-48 overflow-y-auto space-y-1">
                                {selectedPois.length === 0 && <p className="text-xs text-center text-gray-500 py-4">Trascina qui le tappe o usa il tasto '+'</p>}
                                {selectedPois.map((poi, index) => (
                                    <div 
                                      key={poi.id} 
                                      draggable
                                      onDragStart={(e) => onDragStart(e, poi)}
                                      onDragOver={(e) => onDragOver(e, index)}
                                      onDragEnd={onDragEnd}
                                      className={`flex items-center justify-between p-1 rounded-md bg-white/80 cursor-grab ${draggedItem?.id === poi.id ? 'opacity-50' : ''}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">☰</span>
                                            <span className="text-sm font-sans-display">{poi.title}</span>
                                        </div>
                                        <button onClick={() => handleRemovePoi(poi.id)} className="text-xs bg-red-200 text-red-800 rounded-full w-5 h-5 flex items-center justify-center font-bold hover:bg-red-300">-</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                      </div>
                  </div>
                </div>
                <footer className="p-4 border-t border-gray-300/80 flex justify-end gap-3 sticky bottom-0 bg-[#FAF7F0]/80 backdrop-blur-sm">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 font-sans-display font-semibold hover:bg-gray-300 transition-colors rounded-md">Annulla</button>
                    <button onClick={handleSubmit} className="px-4 py-2 text-white bg-[#134A79] font-sans-display font-semibold hover:bg-[#103a60] transition-colors rounded-md">Salva Itinerario</button>
                </footer>
            </div>
            <style>{`@keyframes fade-in{from{opacity:0}to{opacity:1}}.animate-fade-in{animation:fade-in .3s ease-out forwards}@keyframes slide-up{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}.animate-slide-up{animation:slide-up .3s ease-out forwards}`}</style>
        </div>
    );
};

export default AddItineraryModal;
