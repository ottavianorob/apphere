import { useState } from 'react';
import MapView from './components/MapView';
import BottomSheet from './components/ui/BottomSheet';
import { Place } from './components/types'; // adatta se il tipo è altrove

function App() {
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

export default App;