import React, { useState } from 'react';
import { Character, Coordinates } from '../types';
import CloseIcon from './icons/CloseIcon';
import CameraIcon from './icons/CameraIcon';
import MapPinIcon from './icons/MapPinIcon';
import PhotoLocationModal from './PhotoLocationModal';

type NewPhoto = { type: 'file', file: File, dataUrl: string, caption: string, coordinates?: Coordinates | null } | { type: 'url', url: string, caption: string, coordinates?: Coordinates | null, error?: string };

interface AddCharacterModalProps {
  onClose: () => void;
  onSave: (characterData: Omit<Character, 'id' | 'photos'>, photosToUpload: { file: File, caption: string, coordinates?: Coordinates | null }[], urlPhotos: { url: string; caption: string, coordinates?: Coordinates | null }[]) => void;
}

const AddCharacterModal: React.FC<AddCharacterModalProps> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [wikipediaUrl, setWikipediaUrl] = useState('');
    const [photos, setPhotos] = useState<NewPhoto[]>([]);
    
    const [photoInputMode, setPhotoInputMode] = useState<'upload' | 'url'>('upload');
    const [photoUrl, setPhotoUrl] = useState('');
    const [photoUrlCaption, setPhotoUrlCaption] = useState('');
    const [photoLocationModal, setPhotoLocationModal] = useState<{ photoIndex: number; initialCoordinates: Coordinates | null } | null>(null);


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
                    setPhotos(prev => [...prev, { type: 'file', file, dataUrl: reader.result as string, caption: '', coordinates: null }]);
                };
                reader.readAsDataURL(file);
            });
        }
    };
    
    const handleAddUrlPhoto = () => {
        if (photoUrl.trim()) {
            try {
                new URL(photoUrl); // Validate URL
                setPhotos(prev => [...prev, { type: 'url', url: photoUrl, caption: photoUrlCaption, coordinates: null }]);
                setPhotoUrl('');
                setPhotoUrlCaption('');
            } catch (_) {
                alert('Per favore, inserisci un URL valido.');
            }
        }
    };

    const handlePhotoCaptionChange = (index: number, caption: string) => {
        setPhotos(prev => prev.map((p, i) => i === index ? { ...p, caption } : p));
    };

    const handleRemovePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleSavePhotoLocation = (newCoords: Coordinates | null) => {
        if (photoLocationModal) {
            setPhotos(current => current.map((p, i) => i === photoLocationModal.photoIndex ? { ...p, coordinates: newCoords } : p));
        }
        setPhotoLocationModal(null);
    };

    const handleImageError = (index: number) => {
        setPhotos(prev => prev.map((p, i) =>
            i === index && p.type === 'url'
                ? { ...p, error: "Impossibile caricare l'immagine a causa delle restrizioni del sito di origine (CORS). Prova a scaricare l'immagine e a caricarla direttamente." }
                : p
        ));
    };


    const handleSubmit = () => {
        const errors: string[] = [];
        if (!name.trim()) {
            errors.push("Il nome è obbligatorio.");
        }
        
        const photosWithErrors = photos.filter(p => 'error' in p && p.error);
        if (photosWithErrors.length > 0) {
            errors.push("Una o più immagini da URL non possono essere caricate. Rimuovile o correggi l'URL prima di salvare.");
        }

        if (errors.length > 0) {
            alert(`Per favore, correggi i seguenti errori:\n\n- ${errors.join('\n- ')}`);
            return;
        }

        const newCharacterData: Omit<Character, 'id' | 'photos'> = {
            name,
            description,
            wikipediaUrl,
        };
        const photosToUpload = photos.filter((p): p is Extract<NewPhoto, { type: 'file' }> => p.type === 'file').map(p => ({ file: p.file, caption: p.caption, coordinates: p.coordinates }));
        const urlPhotos = photos.filter((p): p is Extract<NewPhoto, { type: 'url' }> => p.type === 'url').map(p => ({ url: p.url, caption: p.caption, coordinates: p.coordinates }));
        
        onSave(newCharacterData, photosToUpload, urlPhotos);
    };

    const labelStyle = "font-sans-display text-sm font-semibold text-gray-700 mb-1 block";
    const inputStyle = "w-full px-3 py-2 border border-gray-300 bg-white/50 focus:ring-1 focus:ring-[#134A79] focus:border-[#134A79] outline-none font-sans-display";

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-fade-in" onClick={onClose}>
        {photoLocationModal !== null && (
            <PhotoLocationModal 
                onClose={() => setPhotoLocationModal(null)}
                onSave={handleSavePhotoLocation}
                initialCoordinates={photoLocationModal.initialCoordinates}
            />
        )}
        <div className="bg-[#FAF7F0] w-full max-w-lg max-h-[90vh] flex flex-col animate-slide-up border border-black/10 relative" onClick={(e) => e.stopPropagation()}>
            <header className="p-4 flex items-center justify-between border-b border-gray-300/80">
              <h2 className="font-sans-display text-2xl font-bold text-[#134A79]">Aggiungi nuovo Personaggio</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon className="w-6 h-6" /></button>
            </header>
            <div className="overflow-y-auto p-6 space-y-4">
               <div>
                  <label htmlFor="char-name" className={labelStyle}>Nome *</label>
                  <input id="char-name" type="text" value={name} onChange={e => setName(e.target.value)} className={inputStyle} required/>
              </div>
               <div>
                  <label htmlFor="char-desc" className={labelStyle}>Descrizione</label>
                  <textarea id="char-desc" value={description} onChange={e => setDescription(e.target.value)} className={`${inputStyle} h-24`} />
              </div>
              <div>
                  <label htmlFor="char-wiki" className={labelStyle}>URL Wikipedia</label>
                  <input id="char-wiki" type="url" value={wikipediaUrl} onChange={e => setWikipediaUrl(e.target.value)} className={inputStyle} placeholder="https://it.wikipedia.org/..."/>
              </div>
               <div>
                  <label className={labelStyle}>Foto</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                        {photos.map((photo, index) => (
                            <div key={index} className="relative group border border-gray-300/80 p-1 flex flex-col">
                                {photo.type === 'url' && photo.error ? (
                                    <div className="w-full h-24 bg-red-100 flex items-center justify-center p-2 text-center">
                                        <p className="text-xs text-red-700 font-sans-display">{photo.error}</p>
                                    </div>
                                ) : (
                                    <img
                                        src={photo.type === 'file' ? photo.dataUrl : photo.url}
                                        alt={`Anteprima ${index + 1}`}
                                        className="w-full h-24 object-cover"
                                        onError={photo.type === 'url' ? () => handleImageError(index) : undefined}
                                        crossOrigin="anonymous"
                                    />
                                )}
                                <input type="text" placeholder="Didascalia..." value={photo.caption} onChange={(e) => handlePhotoCaptionChange(index, e.target.value)} className="w-full text-xs p-1 border-t border-gray-300/80" />
                                <button onClick={() => setPhotoLocationModal({ photoIndex: index, initialCoordinates: photo.coordinates || null })} className={`text-xs p-1 flex items-center justify-center gap-1 w-full border-t border-gray-300/80 ${photo.coordinates ? 'text-green-700' : 'text-gray-500'}`}>
                                    <MapPinIcon className="w-3 h-3" /> {photo.coordinates ? 'Posizione salvata' : 'Aggiungi posizione'}
                                </button>
                                <button onClick={() => handleRemovePhoto(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CloseIcon className="w-3 h-3"/>
                                </button>
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
                            <label htmlFor="char-photo-upload" className="cursor-pointer mt-2 w-full h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 hover:border-[#134A79] hover:text-[#134A79] transition-colors">
                                <div className="text-center p-2"><CameraIcon className="w-8 h-8 mx-auto"/><span className="text-xs font-sans-display mt-1 block">Aggiungi foto</span></div>
                            </label>
                            <input id="char-photo-upload" type="file" multiple className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg" />
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
            </div>
            <footer className="p-4 border-t border-gray-300/80 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 font-sans-display font-semibold hover:bg-gray-300 transition-colors rounded-md">Annulla</button>
                <button onClick={handleSubmit} className="px-4 py-2 text-white bg-[#134A79] font-sans-display font-semibold hover:bg-[#103a60] transition-colors rounded-md">Salva Personaggio</button>
            </footer>
        </div>
        <style>{`@keyframes fade-in{from{opacity:0}to{opacity:1}}.animate-fade-in{animation:fade-in .3s ease-out forwards}@keyframes slide-up{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}.animate-slide-up{animation:slide-up .3s ease-out forwards}`}</style>
      </div>
    );
};

export default AddCharacterModal;