import { PlusIcon, Edit2Icon } from 'lucide-react';

type Props = {
  mode: 'add' | 'edit';
  onClick: () => void;
};

export default function FloatingActionButton({ mode, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      aria-label={
        mode === 'add' ? 'Aggiungi nuovo pin' : 'Modifica pin selezionato'
      }
      className="fixed bottom-16 right-4 bg-accent-bordeaux dark:bg-accent-gold p-4 rounded-full shadow-lg text-white dark:text-accent-bordeaux hover:bg-accent-gold dark:hover:bg-accent-bordeaux focus:outline-none focus:ring-2 focus:ring-accent-bordeaux dark:focus:ring-accent-gold border-2 border-accent-gold dark:border-accent-gold transition-transform duration-150"
      style={{ transition: 'transform 0.15s cubic-bezier(0.33,0,0.2,1)' }}
      onPointerDown={e => (e.currentTarget.style.transform = 'scale(0.9)')}
      onPointerUp={e => (e.currentTarget.style.transform = '')}
      onPointerLeave={e => (e.currentTarget.style.transform = '')}
    >
      {mode === 'add' ? <PlusIcon size={24} /> : <Edit2Icon size={24} />}
    </button>
  );
}