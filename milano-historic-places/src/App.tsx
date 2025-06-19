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
    <div className="min-h-screen bg-newspaper-bg flex flex-col md:flex-row md:items-stretch">
      {/* Navbar: topbar su desktop, bottomnav su mobile */}
      <div className="md:w-full md:fixed md:top-0 md:left-0 md:right-0 md:z-30">
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
      {/* Main content: flex-row su desktop */}
      <div className="flex-1 flex flex-col md:flex-row md:pt-16 max-w-full md:max-w-[1600px] mx-auto w-full">
        {/* Mappa: occupa 2/3 su desktop */}
        {activeTab === 'map' && (
          <div className="flex-1 min-h-[60vh] md:min-h-screen md:w-2/3">
            <MapView selectedPlace={selected} onSelect={setSelected} />
            {activeTab === 'map' && (
              <FloatingActionButton
                mode={fabMode}
                onClick={() => {
                  if (fabMode === 'add') {
                    // ...azione add...
                  }
                }}
              />
            )}
          </div>
        )}
        {/* Pannello laterale: itinerari, profilo, dettagli */}
        <div className="w-full md:w-1/3 bg-newspaper-bg border-l border-neutral-light flex flex-col md:min-h-screen">
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
          {/* Dettaglio place: laterale su desktop, overlay su mobile */}
          {selected && (
            <div className="hidden md:block">
              <BottomSheet
                place={selected}
                photos={selectedPhotos}
                characters={selectedChars}
                onClose={() => setSelected(null)}
              />
            </div>
          )}
        </div>
        {/* Dettaglio place overlay su mobile */}
        {selected && (
          <div className="block md:hidden">
            <BottomSheet
              place={selected}
              photos={selectedPhotos}
              characters={selectedChars}
              onClose={() => setSelected(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}