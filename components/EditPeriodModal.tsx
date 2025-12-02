import React, { useState, useEffect } from 'react';
import CloseIcon from './icons/CloseIcon';
import { Period } from '../types';

interface EditPeriodModalProps {
  onClose: () => void;
  onSave: (id: string, name: string, start_year: number, end_year: number) => void;
  period: Period;
}

const EditPeriodModal: React.FC<EditPeriodModalProps> = ({ onClose, onSave, period }) => {
    const [name, setName] = useState('');
    const [startYear, setStartYear] = useState('');
    const [endYear, setEndYear] = useState('');

    useEffect(() => {
      if (period) {
        setName(period.name);
        setStartYear(String(period.start_year));
        setEndYear(String(period.end_year));
      }
    }, [period]);

    const handleSubmit = () => {
        const start = parseInt(startYear, 10);
        const end = parseInt(endYear, 10);
        const errors: string[] = [];

        if (!name.trim()) errors.push("Il nome del periodo è obbligatorio.");
        if (isNaN(start)) errors.push("L'anno di inizio deve essere un numero valido.");
        if (isNaN(end)) errors.push("L'anno di fine deve essere un numero valido.");
        if (!isNaN(start) && !isNaN(end) && start > end) errors.push("L'anno di inizio non può essere successivo all'anno di fine.");

        if (errors.length > 0) {
            alert(`Per favore, correggi i seguenti errori:\n\n- ${errors.join('\n- ')}`);
            return;
        }
        onSave(period.id, name, start, end);
    };

    const labelStyle = "font-sans-display text-sm font-semibold text-gray-700 mb-1 block";
    const inputStyle = "w-full px-3 py-2 border border-gray-300 bg-white/50 focus:ring-1 focus:ring-[#134A79] focus:border-[#134A79] outline-none font-sans-display";

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-fade-in" onClick={onClose}>
        <div className="bg-[#FAF7F0] w-full max-w-md max-h-[90vh] flex flex-col animate-slide-up border border-black/10 relative" onClick={(e) => e.stopPropagation()}>
            <header className="p-4 flex items-center justify-between border-b border-gray-300/80">
              <h2 className="font-sans-display text-2xl font-bold text-[#134A79]">Modifica Periodo Storico</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon className="w-6 h-6" /></button>
            </header>
            <div className="p-6 space-y-4">
               <div>
                  <label htmlFor="period-name" className={labelStyle}>Nome Periodo *</label>
                  <input id="period-name" type="text" value={name} onChange={e => setName(e.target.value)} className={inputStyle} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="period-start" className={labelStyle}>Anno Inizio *</label>
                    <input id="period-start" type="number" value={startYear} onChange={e => setStartYear(e.target.value)} className={inputStyle} required />
                </div>
                 <div>
                    <label htmlFor="period-end" className={labelStyle}>Anno Fine *</label>
                    <input id="period-end" type="number" value={endYear} onChange={e => setEndYear(e.target.value)} className={inputStyle} required />
                </div>
              </div>
               <p className="text-xs text-gray-500 mt-1 font-sans-display">L'ID ({period.id}) non può essere modificato.</p>
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

export default EditPeriodModal;
