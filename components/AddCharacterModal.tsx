import React, { useState } from 'react';
import { Character, Photo } from '../types';
import CloseIcon from './icons/CloseIcon';
import CameraIcon from './icons/CameraIcon';

interface AddCharacterModalProps {
  onClose: () => void;
  onSave: (character: Omit<Character, 'id'>) => void;
}

const AddCharacterModal: React.FC<AddCharacterModalProps> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [wikipediaUrl, setWikipediaUrl] = useState('');
    const [photoDataUrl, setPhotoDataUrl] = useState('');
    const [photoCaption, setPhotoCaption] = useState('');

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
        if (!name) {
            alert('Il Nome è obbligatorio.');
            return;
        }
        
        const photos: Photo[] = photoDataUrl 
            ? [{ id: `new_photo_${Date.now()}`, url: photoDataUrl, caption: photoCaption }] 
            : [];

        const newCharacter: Omit<Character, 'id'> = {
            name,
            description,
            wikipediaUrl,
            photos,
        };
        onSave(newCharacter);
    };

    const labelStyle = "font-sans-display text-sm font-semibold text-gray-700 mb-1 block";
    const inputStyle = "w-full px-3 py-2 border border-gray-300 bg-white/50 focus:ring-1 focus:ring-[#134A79] focus:border-[#134A79] outline-none font-sans-display";

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-fade-in" onClick={onClose}>
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
                  <label className={labelStyle}>Foto del personaggio</label>
                  <div className="mt-1 flex items-start gap-4">
                      <div className="w-32 flex-shrink-0">
                          <label htmlFor="char-photo-upload" className="cursor-pointer block w-full h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 hover:border-[#134A79] hover:text-[#134A79] transition-colors overflow-hidden">
                              {photoDataUrl ? (
                                  <img src={photoDataUrl} alt="Anteprima" className="w-full h-full object-cover"/>
                              ) : (
                                  <div className="text-center p-2">
                                      <CameraIcon className="w-8 h-8 mx-auto"/>
                                      <span className="text-xs font-sans-display mt-1 block">Carica foto</span>
                                  </div>
                              )}
                          </label>
                          <input id="char-photo-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg" />
                      </div>
                      <div className="flex-grow">
                          <label htmlFor="char-photo-caption" className={labelStyle}>Didascalia Foto</label>
                          <input id="char-photo-caption" type="text" value={photoCaption} onChange={e => setPhotoCaption(e.target.value)} className={inputStyle} />
                           {photoDataUrl && (
                               <button onClick={() => {
                                   const input = document.getElementById('char-photo-upload') as HTMLInputElement;
                                   if(input) input.value = '';
                                   setPhotoDataUrl('');
                               }} className="mt-2 text-xs text-red-600 hover:underline font-sans-display">Rimuovi immagine</button>
                          )}
                      </div>
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