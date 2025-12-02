import React, { useState, useEffect } from 'react';
import { Character, Photo } from '../types';
import CloseIcon from './icons/CloseIcon';
import CameraIcon from './icons/CameraIcon';

type PhotoUpload = {
    file: File;
    dataUrl: string;
    caption: string;
};

interface EditCharacterModalProps {
  onClose: () => void;
  onSave: (
    charId: string,
    characterData: Omit<Character, 'id' | 'photos'>,
    photosToUpload: { file: File, caption: string }[],
    photosToDelete: Photo[]
  ) => void;
  character: Character;
}

const EditCharacterModal: React.FC<EditCharacterModalProps> = ({ onClose, onSave, character }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [wikipediaUrl, setWikipediaUrl] = useState('');
    const [existingPhotos, setExistingPhotos] = useState<Photo[]>([]);
    const [newPhotos, setNewPhotos] = useState<PhotoUpload[]>([]);
    const [photosToDelete, setPhotosToDelete] = useState<Photo[]>([]);

    useEffect(() => {
        if (character) {
            setName(character.name);
            setDescription(character.description);
            setWikipediaUrl(character.wikipediaUrl);
            setExistingPhotos(character.photos);
        }
    }, [character]);

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
        if (!name.trim()) {
            alert("Il nome è obbligatorio.");
            return;
        }

        const updatedData: Omit<Character, 'id' | 'photos'> = { name, description, wikipediaUrl };
        onSave(character.id, updatedData, newPhotos.map(p => ({ file: p.file, caption: p.caption })), photosToDelete);
    };

    const labelStyle = "font-sans-display text-sm font-semibold text-gray-700 mb-1 block";
    const inputStyle = "w-full px-3 py-2 border border-gray-300 bg-white/50 focus:ring-1 focus:ring-[#134A79] focus:border-[#134A79] outline-none font-sans-display";

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-fade-in" onClick={onClose}>
        <div className="bg-[#FAF7F0] w-full max-w-lg max-h-[90vh] flex flex-col animate-slide-up border border-black/10 relative" onClick={(e) => e.stopPropagation()}>
            <header className="p-4 flex items-center justify-between border-b border-gray-300/80">
              <h2 className="font-sans-display text-2xl font-bold text-[#134A79]">Modifica Personaggio</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon className="w-6 h-6" /></button>
            </header>
            <div className="overflow-y-auto p-6 space-y-4">
               <div>
                  <label htmlFor="char-name" className={labelStyle}>Nome *</label>
                  <input id="char-name" type="text" value={name} onChange={e => setName(e.target.value)} className={inputStyle} required/>
              </div>
              {/* ... other fields ... */}
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
                       <label htmlFor="char-photo-upload" className="cursor-pointer w-full h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 hover:border-[#134A79] hover:text-[#134A79] transition-colors">
                            <div className="text-center p-2">
                                <CameraIcon className="w-8 h-8 mx-auto"/>
                                <span className="text-xs font-sans-display mt-1 block">Aggiungi foto</span>
                            </div>
                        </label>
                        <input id="char-photo-upload" type="file" multiple className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg" />
                    </div>
              </div>
            </div>
            <footer className="p-4 border-t border-gray-300/80 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 font-sans-display font-semibold hover:bg-gray-300 transition-colors rounded-md">Annulla</button>
                <button onClick={handleSubmit} className="px-4 py-2 text-white bg-[#134A79] font-sans-display font-semibold hover:bg-[#103a60] transition-colors rounded-md">Salva Modifiche</button>
            </footer>
        </div>
      </div>
    );
};

export default EditCharacterModal;
