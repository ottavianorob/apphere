import { useState } from 'react';
import MapView from './components/MapView';
import BottomSheet from './components/ui/BottomSheet';
import BottomNav from './components/ui/BottomNav';
import type { Place } from './components/types';
import FloatingActionButton from './components/ui/FloatingActionButton';

export default function App() {
  const [selected, setSelected] = useState<Place | null>(null);
  const fabMode = selected ? 'edit' : 'add';

  return (
    <>
      <MapView onSelect={setSelected} />
      {selected && (
        <BottomSheet place={selected} onClose={() => setSelected(null)} />
      )}
      <BottomNav />
      <FloatingActionButton
        mode={fabMode}
        onClick={() => {
          if (fabMode === 'add') {
            // TODO: logica aggiunta pin
          } else {
            // TODO: logica modifica pin selezionato
          }
        }}
      />
    </>
  );
}

export default function App() {
  const [selected, setSelected] = useState<Place | null>(null);

  return (
    <>
      <MapView onSelect={setSelected} />
      {selected && (
        <BottomSheet place={selected} onClose={() => setSelected(null)} />
      )}
      <BottomNav />
    </>
  );
}