import React, { useState, useEffect } from 'react';
import CloseIcon from './icons/CloseIcon';
import { Category } from '../types';

interface EditCategoryModalProps {
  onClose: () => void;
  onSave: (id: string, name: string) => void;
  category: Category;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({ onClose, onSave, category }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        if (category) {
            setName(category.name);
        }
    }, [category]);

    const handleSubmit = () => {
        if (!name.trim()) {
            alert("Il nome della categoria è obbligatorio.");
            return;
        }
        onSave(category.id, name);
    };

    const labelStyle = "font-sans-display text-sm font-semibold text-gray-700 mb-1 block";
    const inputStyle = "w-full px-3 py-2 border border-gray-300 bg-white/50 focus:ring-1 focus:ring-[#134A79] focus:border-[#134A79] outline-none font-sans-display";

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-fade-in" onClick={onClose}>
        <div className="bg-[#FAF7F0] w-full max-w-md max-h-[90vh] flex flex-col animate-slide-up border border-black/10 relative" onClick={(e) => e.stopPropagation()}>
            <header className="p-4 flex items-center justify-between border-b border-gray-300/80">
              <h2 className="font-sans-display text-2xl font-bold text-[#134A79]">Modifica Categoria</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon className="w-6 h-6" /></button>
            </header>
            <div className="p-6 space-y-4">
               <div>
                  <label htmlFor="cat-name" className={labelStyle}>Nome Categoria *</label>
                  <input id="cat-name" type="text" value={name} onChange={e => setName(e.target.value)} className={inputStyle} required/>
                  <p className="text-xs text-gray-500 mt-1 font-sans-display">L'ID ({category.id}) non può essere modificato.</p>
              </div>
            </div>
            <footer className="p-4 border-t border-gray-300/80 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 font-sans-display font-semibold hover:bg-gray-300 transition-colors rounded-md">Annulla</button>
                <button onClick={handleSubmit} className="px-4 py-2 text-white bg-[#134A79] font-sans-display font-semibold hover:bg-[#103a60] transition-colors rounded-md">Salva Modifiche</button>
            </footer>
        </div>
        <style>{`@keyframes fade-in{from{opacity:0}to{opacity:1}}.animate-fade-in{animation:fade-in .3s ease-out forwards}@keyframes slide-up{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}.animate-slide-up{animation:slide-up .3s ease-out forwards}`}</style>
      </div>
    );
};

export default EditCategoryModal;
