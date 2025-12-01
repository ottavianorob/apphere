import React, { useState, useEffect } from 'react';
import { Poi, Itinerary, Character } from './types';
import { points, paths, categories, periods, areas, itineraries, characters } from './data/mockData';
import MapView from './components/MapView';
import SettingsView from './components/SettingsView';
import BottomNav from './components/BottomNav';
import PoiDetailModal from './components/PoiDetailModal';
import ItinerariesView from './components/ItinerariesView';
import ItineraryDetailModal from './components/ItineraryDetailModal';
import CharacterDetailModal from './components/CharacterDetailModal';

export type View = 'map' | 'itineraries' | 'settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('map');
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  
  const allPois: Poi[] = [...points, ...paths, ...areas];

  useEffect(() => {
    const isModalOpen = selectedPoi || selectedItinerary || selectedCharacter;
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPoi, selectedItinerary, selectedCharacter]);

  const openCharacterModal = (characterId: string) => {
    const character = characters.find(c => c.id === characterId);
    if (character) {
      setSelectedCharacter(character);
    }
  }

  const renderView = () => {
    switch (currentView) {
      case 'map':
        return <MapView 
          pois={allPois}
          onSelectPoi={setSelectedPoi} 
          categories={categories} 
          periods={periods} 
        />;
      case 'itineraries':
        return <ItinerariesView 
          itineraries={itineraries}
          onSelectItinerary={setSelectedItinerary}
        />;
      case 'settings':
        return <SettingsView />;
      default:
        return <MapView 
          pois={allPois}
          onSelectPoi={setSelectedPoi} 
          categories={categories} 
          periods={periods}
        />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-6 pb-24">
        {renderView()}
      </main>
      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
      {selectedPoi && (
        <PoiDetailModal 
          poi={selectedPoi} 
          onClose={() => setSelectedPoi(null)} 
          categories={categories}
          onSelectCharacter={openCharacterModal}
        />
      )}
      {selectedItinerary && (
        <ItineraryDetailModal
          itinerary={selectedItinerary}
          allPois={allPois}
          onClose={() => setSelectedItinerary(null)}
          onSelectPoiInItinerary={setSelectedPoi}
        />
      )}
      {selectedCharacter && (
        <CharacterDetailModal
          character={selectedCharacter}
          allPois={allPois}
          onClose={() => setSelectedCharacter(null)}
          onSelectPoi={setSelectedPoi}
        />
      )}
    </div>
  );
};

export default App;