import { useState } from 'react';
import MapView from './components/MapView';
import BottomSheet from './components/ui/BottomSheet';
import BottomNav from './components/ui/BottomNav';
import FloatingActionButton from './components/ui/FloatingActionButton';
import type { Place } from './components/types';
import ItinerariesPage from './components/ItinerariesPage';

const [activeTab, setActiveTab] = useState<'map'|'playlists'|'profile'>('map');
// ...
{activeTab === 'playlists' && (
  <ItinerariesPage onStart={(it, places) => {
    // Imposta i markers e la rotta su MapView
  }} />
)}

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
            // TODO: implement add pin logic
          } else {
            // TODO: implement edit pin logic
          }
        }}
      />
    </>
  );
}