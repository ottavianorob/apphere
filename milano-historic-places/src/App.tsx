import React, { useState } from 'react';
import MapView from './components/MapView';
import BottomSheet from './components/ui/BottomSheet';
import BottomNav from './components/ui/BottomNav';
import FloatingActionButton from './components/ui/FloatingActionButton';
import type { Place } from './components/types';
import ItinerariesPage from './components/ItinerariesPage';
import placesData from './types/places.json';
import photosData from './types/photos.json';
import charactersData from './types/characters.json';
import itinerariesData from './types/itineraries.json';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'playlists' | 'profile'>('map');
  const [selected, setSelected] = useState<Place | null>(null);
  const fabMode = selected ? 'edit' : 'add';

  const selectedPhotos = selected
    ? photosData.filter(p => selected.photoIds?.includes(p.id))
    : [];
  const selectedChars = selected
    ? charactersData.filter(c => selected.characterIds?.includes(c.id))
    : [];

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 relative">
        {activeTab === 'map' && <MapView selectedPlace={selected} onSelect={setSelected} />}
        {activeTab === 'playlists' && (
          <ItinerariesPage
            itineraries={itinerariesData}
            places={placesData}
            onStart={(it, stops) => {
              const firstPlace = placesData.find(p => p.id === stops[0]);
              if (firstPlace) {
                setActiveTab('map');
                setSelected(firstPlace);
              }
            }}
          />
        )}
        {activeTab === 'profile' && <div>Profilo (placeholder)</div>}
        {selected && (
          <BottomSheet
            place={selected}
            photos={selectedPhotos}
            characters={selectedChars}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
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