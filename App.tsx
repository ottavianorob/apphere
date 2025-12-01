import React, { useState, useEffect, useMemo } from 'react';
import { Poi, Itinerary, Character, Category } from './types';
import { points, paths, categories, periods, areas, itineraries, characters, users } from './data/mockData';

// Import Views
import HomeView from './components/HomeView';
import QuiView from './components/QuiView';
import ItinerariesView from './components/ItinerariesView';
import SearchView from './components/SearchView';
import ProfileView from './components/ProfileView';

// Import Modals
import PoiDetailModal from './components/PoiDetailModal';
import ItineraryDetailModal from './components/ItineraryDetailModal';
import CharacterDetailModal from './components/CharacterDetailModal';
import TagDetailModal from './components/TagDetailModal';
import AddPoiModal from './components/AddPoiModal';
import AddCharacterModal from './components/AddCharacterModal';
import AddItineraryModal from './components/AddItineraryModal';


import BottomNav from './components/BottomNav';


export type View = 'home' | 'qui' | 'itineraries' | 'search' | 'profile';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('profile');
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [isAddPoiModalOpen, setIsAddPoiModalOpen] = useState(false);
  const [isAddCharacterModalOpen, setIsAddCharacterModalOpen] = useState(false);
  const [isAddItineraryModalOpen, setIsAddItineraryModalOpen] = useState(false);
  
  const allPois: Poi[] = [...points, ...paths, ...areas];
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), []);


  useEffect(() => {
    const isModalOpen = selectedPoi || selectedItinerary || selectedCharacter || selectedTag || isAddPoiModalOpen || isAddCharacterModalOpen || isAddItineraryModalOpen;
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPoi, selectedItinerary, selectedCharacter, selectedTag, isAddPoiModalOpen, isAddCharacterModalOpen, isAddItineraryModalOpen]);

  const openCharacterModal = (character: Character) => {
    setSelectedPoi(null);
    setSelectedItinerary(null);
    setSelectedTag(null);
    setSelectedCharacter(character);
  };

  const openTagModal = (tagName: string) => {
    setSelectedPoi(null);
    setSelectedItinerary(null);
    setSelectedCharacter(null);
    setSelectedTag(tagName);
  };

  const openPoiModal = (poi: Poi) => {
    setSelectedItinerary(null);
    setSelectedCharacter(null);
    setSelectedTag(null);
    setSelectedPoi(poi);
  };

  const openItineraryModal = (itinerary: Itinerary) => {
    setSelectedPoi(null);
    setSelectedCharacter(null);
    setSelectedTag(null);
    setSelectedItinerary(itinerary);
  };
  
  const handleSavePoi = (newPoi: Omit<Poi, 'id' | 'creationDate' | 'author'>) => {
    console.log("Saving new POI:", {
      ...newPoi,
      id: `new_poi_${Date.now()}`,
      creationDate: new Date().toISOString(),
      author: 'Mario Rossi' // Logged-in user
    });
    // In a real app, you would add the new POI to your state/backend
    setIsAddPoiModalOpen(false);
  };

  const handleSaveCharacter = (newCharacter: Omit<Character, 'id'>) => {
    console.log("Saving new Character:", { ...newCharacter, id: `new_char_${Date.now()}` });
    setIsAddCharacterModalOpen(false);
  };

  const handleSaveItinerary = (newItinerary: Omit<Itinerary, 'id' | 'author'>) => {
    console.log("Saving new Itinerary:", { 
        ...newItinerary, 
        id: `new_it_${Date.now()}`,
        author: 'Mario Rossi'
    });
    setIsAddItineraryModalOpen(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView 
          allPois={allPois}
          allItineraries={itineraries}
          allUsers={users}
          onSelectPoi={openPoiModal}
          onSelectItinerary={openItineraryModal}
          onSelectTag={openTagModal}
          categoryMap={categoryMap}
        />;
      case 'qui':
        return <QuiView 
          pois={allPois}
          onSelectPoi={openPoiModal} 
          categories={categories} 
          periods={periods} 
        />;
      case 'itineraries':
        return <ItinerariesView 
          itineraries={itineraries}
          onSelectItinerary={openItineraryModal}
        />;
      case 'search':
        return <SearchView 
            allPois={allPois}
            categories={categories}
            periods={periods}
            onSelectPoi={openPoiModal}
            categoryMap={categoryMap}
        />;
      case 'profile':
        return <ProfileView 
            onAddPoiClick={() => setIsAddPoiModalOpen(true)}
            onAddCharacterClick={() => setIsAddCharacterModalOpen(true)}
            onAddItineraryClick={() => setIsAddItineraryModalOpen(true)}
        />;
      default:
        return <QuiView 
          pois={allPois}
          onSelectPoi={openPoiModal} 
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
          onSelectCharacter={(characterId: string) => {
            const char = characters.find(c => c.id === characterId);
            if (char) openCharacterModal(char);
          }}
          onSelectTag={openTagModal}
        />
      )}
      {selectedItinerary && (
        <ItineraryDetailModal
          itinerary={selectedItinerary}
          allPois={allPois}
          onClose={() => setSelectedItinerary(null)}
          onSelectPoiInItinerary={openPoiModal}
          onSelectTag={openTagModal}
        />
      )}
      {selectedCharacter && (
        <CharacterDetailModal
          character={selectedCharacter}
          allPois={allPois}
          categories={categories}
          onClose={() => setSelectedCharacter(null)}
          onSelectPoi={openPoiModal}
          onSelectTag={openTagModal}
        />
      )}
      {selectedTag && (
        <TagDetailModal
          tag={selectedTag}
          allPois={allPois}
          allItineraries={itineraries}
          allCharacters={characters}
          categories={categories}
          onClose={() => setSelectedTag(null)}
          onSelectPoi={openPoiModal}
          onSelectItinerary={(itineraryId: string) => {
              const it = itineraries.find(i => i.id === itineraryId);
              if (it) openItineraryModal(it);
          }}
          onSelectCharacter={(characterId: string) => {
              const char = characters.find(c => c.id === characterId);
              if(char) openCharacterModal(char);
          }}
        />
      )}

      {isAddPoiModalOpen && (
        <AddPoiModal
          onClose={() => setIsAddPoiModalOpen(false)}
          onSave={handleSavePoi}
          categories={categories}
          periods={periods}
          characters={characters}
        />
      )}
      {isAddCharacterModalOpen && (
        <AddCharacterModal
          onClose={() => setIsAddCharacterModalOpen(false)}
          onSave={handleSaveCharacter}
        />
      )}
      {isAddItineraryModalOpen && (
        <AddItineraryModal
          onClose={() => setIsAddItineraryModalOpen(false)}
          onSave={handleSaveItinerary}
          allPois={allPois}
        />
      )}
    </div>
  );
};

export default App;