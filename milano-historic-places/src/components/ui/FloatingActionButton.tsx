// src/components/ui/FloatingActionButton.tsx
import { PlusIcon, Edit2Icon } from 'lucide-react';

type Props = { mode: 'add' | 'edit'; onClick: () => void };

export default function FAB({ mode, onClick }: Props) {
  return (
    <button type="button" aria-label={mode === 'add' ? 'Aggiungi nuovo pin' : 'Modifica pin selezionato'} onClick={onClick} className="fixed bottom-16 right-4 bg-blue-600 p-4 rounded-full shadow-lg transform transition-transform duration-150 hover:scale-110">
      {mode === 'add' ? <PlusIcon size={24} className="text-white" /> : <Edit2Icon size={24} className="text-white" />}
    </button>
  );
}