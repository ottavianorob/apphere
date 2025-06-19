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

  // Converto itinerariesData (oggetto) in array per ItinerariesPage
  const itinerariesArray = Object.entries(itinerariesData).map(([id, it]) => ({ id, ...it }));

  return (
    <div className="min-h-screen bg-newspaper-bg flex flex-col">
      {/* Container centrale per desktop, padding su mobile/tablet */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-2 sm:px-4 md:px-8 flex flex-col relative">
        {/* Layout a colonne o griglia per desktop, stack su mobile */}
        {activeTab === 'map' && <MapView selectedPlace={selected} onSelect={setSelected} />}
        {activeTab === 'playlists' && (
          <ItinerariesPage
            itineraries={itinerariesArray}
            places={placesData}
            onStart={(it, stops) => {
              if (stops.length > 0) {
                setActiveTab('map');
                setSelected(stops[0] || null);
              }
            }}
          />
        )}
        {activeTab === 'profile' && <div className="py-8 text-center text-text-secondary text-lg font-heading">Profilo (in arrivo)</div>}
        {selected && (
          <BottomSheet
            place={selected}
            photos={selectedPhotos}
            characters={selectedChars}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
      {/* Navbar mobile in basso, su desktop può diventare topbar o sidebar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      {/* FloatingActionButton solo su map, posizionato in basso a destra */}
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