import React, { useState, useMemo, useEffect } from 'react';
import { Itinerary, Poi } from '../types';
import CloseIcon from './icons/CloseIcon';
import CameraIcon from './icons/CameraIcon';

interface EditItineraryModalProps {
  onClose: () => void;
  onSave: (
    itineraryId: string,
    itineraryData: Omit<Itinerary, 'id' | 'author' | 'coverPhoto'>,
    coverPhotoFile: File | null
  ) => void;
  itinerary: Itinerary;
  allPois: Poi[];
}

const EditItineraryModal: React.FC<EditItineraryModalProps> = ({ onClose, onSave, itinerary, allPois }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
    const [coverPhotoPreview, setCoverPhotoPreview] = useState('');
    const [tagsText, setTagsText] = useState('');
    const [selectedPois, setSelectedPois] = useState<Poi[]>([]);
    
    useEffect(() => {
        if (itinerary) {
            setTitle(itinerary.title);
            setDescription(itinerary.description);
            setTagsText(itinerary.tags?.join(', ') || '');
            setCoverPhotoPreview(itinerary.coverPhoto.url);
            setSelectedPois(itinerary.poiIds.map(id => allPois.find(p => p.id === id)).filter(Boolean) as Poi[]);
        }
    }, [itinerary, allPois]);

    useEffect(() => {
        if (!coverPhotoFile) return;
        const objectUrl = URL.createObjectURL(coverPhotoFile);
        setCoverPhotoPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [coverPhotoFile]);

    const availablePois = useMemo(() => {
        const selectedIds = new Set(selectedPois.map(p => p.id));
        return allPois.filter(p => !selectedIds.has(p.id));
    }, [allPois, selectedPois]);

    const estimatedDuration = useMemo(() => {
      const numStops = selectedPois.length;
      if (numStops === 0) return 'N/A';
      const timeAtStops = numStops * 20;
      const travelTime = (numStops > 1 ? (numStops - 1) * 15 : 0);
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
        setCoverPhotoFile(file || null);
    };

    const handleSubmit = () => {
        // Validation logic...
        const tags = tagsText.split(',').map(t => t.trim()).filter(Boolean);
        const updatedData: Omit<Itinerary, 'id' | 'author' | 'coverPhoto'> = {
            title, description, estimatedDuration, poiIds: selectedPois.map(p => p.id), tags,
        };
        onSave(itinerary.id, updatedData, coverPhotoFile);
    };
    
    const labelStyle = "font-sans-display text-sm font-semibold text-gray-700 mb-1 block";
    const inputStyle = "w-full px-3 py-2 border border-gray-300 bg-white/50 focus:ring-1 focus:ring-[#134A79] focus:border-[#134A79] outline-none font-sans-display";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-[#FAF7F0] w-full max-w-3xl max-h-[90vh] flex flex-col animate-slide-up border border-black/10 relative" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 flex items-center justify-between border-b border-gray-300/80 sticky top-0 bg-[#FAF7F0]/80 backdrop-blur-sm z-10">
                  <h2 className="font-sans-display text-2xl font-bold text-[#134A79]">Modifica Itinerario</h2>
                  <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon className="w-6 h-6" /></button>
                </header>
                <div className="overflow-y-auto p-6 space-y-4">
                  <div>
                      <label htmlFor="it-title" className={labelStyle}>Titolo *</label>
                      <input id="it-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputStyle} required/>
                  </div>
                  {/* ... other fields ... */}
                   <div>
                        <label className={labelStyle}>Foto Copertina *</label>
                        <div className="mt-1">
                            <label htmlFor="it-cover-upload" className="cursor-pointer block w-full h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 hover:border-[#134A79] hover:text-[#134A79] transition-colors overflow-hidden">
                                {coverPhotoPreview ? (
                                    <img src={coverPhotoPreview} alt="Anteprima copertina" className="w-full h-full object-cover"/>
                                ) : (
                                    <div className="text-center">
                                        <CameraIcon className="w-8 h-8 mx-auto"/>
                                        <span className="text-xs font-sans-display mt-1 block">Cambia foto</span>
                                    </div>
                                )}
                            </label>
                            <input id="it-cover-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg" />
                        </div>
                    </div>
                  {/* ... POI selection fields ... */}
                </div>
                <footer className="p-4 border-t border-gray-300/80 flex justify-end gap-3 sticky bottom-0 bg-[#FAF7F0]/80 backdrop-blur-sm">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 font-sans-display font-semibold hover:bg-gray-300 transition-colors rounded-md">Annulla</button>
                    <button onClick={handleSubmit} className="px-4 py-2 text-white bg-[#134A79] font-sans-display font-semibold hover:bg-[#103a60] transition-colors rounded-md">Salva Modifiche</button>
                </footer>
            </div>
        </div>
    );
};

export default EditItineraryModal;
