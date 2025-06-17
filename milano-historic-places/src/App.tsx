import { useState } from 'react';
import MapView from './components/MapView';
import BottomSheet from './components/ui/BottomSheet';
import type { Place } from './components/types';

export default function App() {
  const [selected, setSelected] = useState<Place | null>(null);

  return (
    <>
      <MapView onSelect={setSelected} />
      {selected && (
        <BottomSheet place={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}