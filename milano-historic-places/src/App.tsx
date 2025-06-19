import { useState } from 'react';
import MapView from './components/MapView';
import BottomSheet from './components/ui/BottomSheet';
import BottomNav from './components/ui/BottomNav';
import FloatingActionButton from './components/ui/FloatingActionButton';
import type { Place } from './components/types';
import ItinerariesPage from './components/ItinerariesPage';
import placesDataRaw from './types/places.json';
import photosData from './types/photos.json';
import charactersData from './types/characters.json';
import itinerariesData from './types/itineraries.json';
import { AnimatePresence, motion } from 'framer-motion';

const placesData: Place[] = (placesDataRaw as any[]).map(p => ({ ...p, geometry: { ...p.geometry, type: 'Point' } }));

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
      {/* Navbar: topbar su desktop, bottomnav su mobile */}
      <div className="md:w-full md:fixed md:top-0 md:left-0 md:right-0 md:z-30">
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
      {/* Main content: mappa full width, overlay modale su mobile */}
      <div className="flex-1 flex flex-col md:pt-16 w-full relative">
        {/* Mappa sempre a tutta larghezza */}
        {activeTab === 'map' && (
          <div className="flex-1 min-h-[60vh] md:min-h-screen w-full">
            <MapView selectedPlace={selected} onSelect={setSelected} />
            <div className="fixed bottom-20 right-4 z-40 md:bottom-8">
              <FloatingActionButton
                mode={fabMode}
                onClick={() => {
                  if (fabMode === 'add') {
                    // ...azione add...
                  }
                }}
                aria-label={fabMode === 'add' ? 'Aggiungi nuovo luogo' : 'Modifica luogo'}
              />
            </div>
          </div>
        )}
        {/* Overlay modale per itinerari su mobile, laterale su desktop */}
        <AnimatePresence>
        {activeTab === 'playlists' && (
          <motion.div
            key="itineraries"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 md:top-16 md:right-0 w-full h-full md:w-[420px] md:h-[calc(100vh-4rem)] bg-newspaper-bg border-t md:border-t-0 md:border-l border-neutral-light shadow-lg z-40 overflow-y-auto"
            aria-label="Pannello itinerari"
          >
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
          </motion.div>
        )}
        {/* Overlay modale per dettaglio place su mobile, laterale su desktop */}
        {selected && (
          <motion.div
            key="details"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 md:top-16 md:right-0 w-full h-full md:w-[420px] md:h-[calc(100vh-4rem)] bg-newspaper-bg border-t md:border-t-0 md:border-l border-neutral-light shadow-lg z-50 overflow-y-auto"
            aria-label="Dettaglio luogo"
          >
            <BottomSheet
              place={selected}
              photos={selectedPhotos}
              characters={selectedChars}
              onClose={() => setSelected(null)}
            />
          </motion.div>
        )}
        </AnimatePresence>
      </div>
      {/* Navbar mobile sempre visibile in basso */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
}