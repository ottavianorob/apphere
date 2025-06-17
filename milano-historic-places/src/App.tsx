import React, { useState } from 'react';
import MapView from './components/MapView';
import BottomSheet from './components/ui/BottomSheet';
import BottomNav from './components/ui/BottomNav';
import FloatingActionButton from './components/ui/FloatingActionButton';
import type { Place } from './components/types';
import ItinerariesPage from './components/ItinerariesPage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'playlists' | 'profile'>('map');
  const [selected, setSelected] = useState<Place | null>(null);
  const fabMode = selected ? 'edit' : 'add';

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 relative">
        {activeTab === 'map' && <MapView onSelect={setSelected} />}
        {activeTab === 'playlists' && (
          <ItinerariesPage onStart={(it, places) => {/* TODO: integrate with MapView */}} />
        )}
        {activeTab === 'profile' && <div>Profilo (placeholder)</div>}
        {selected && <BottomSheet place={selected} onClose={() => setSelected(null)} />}
      </div>
      <BottomNav />
      {activeTab === 'map' && (
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
      )}
    </div>
  );
}