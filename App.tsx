import React, { useState, useEffect, useMemo } from 'react';
import { Poi, Itinerary, Character, Category, User, Period } from './types';
import { supabase } from './services/supabaseClient';
import { Session } from '@supabase/supabase-js';
import * as api from './services/api';

// Import Views
import LoginView from './components/LoginView';
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
  const [session, setSession] = useState<Session | null>(null);
  const [currentView, setCurrentView] = useState<View>('qui');
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [isAddPoiModalOpen, setIsAddPoiModalOpen] = useState(false);
  const [isAddCharacterModalOpen, setIsAddCharacterModalOpen] = useState(false);
  const [isAddItineraryModalOpen, setIsAddItineraryModalOpen] = useState(false);

  const [allPois, setAllPois] = useState<Poi[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);


  const loadData = async () => {
    setIsLoading(true);
    try {
      const [
        poisData, 
        itinerariesData, 
        charactersData, 
        categoriesData, 
        periodsData,
        usersData
      ] = await Promise.all([
        api.fetchPois(),
        api.fetchItineraries(),
        api.fetchCharacters(),
        api.fetchCategories(),
        api.fetchPeriods(),
        api.fetchUsers()
      ]);
      setAllPois(poisData);
      setItineraries(itinerariesData);
      setCharacters(charactersData);
      setCategories(categoriesData);
      setPeriods(periodsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
        loadData();
    } else {
        // Clear data if user logs out
        setAllPois([]);
        setItineraries([]);
        setCharacters([]);
        setCategories([]);
        setPeriods([]);
        setUsers([]);
        setIsLoading(false);
    }
  }, [session]);


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
  
  const handleSavePoi = async (newPoiData: Omit<Poi, 'id' | 'creationDate' | 'author'>) => {
    try {
      await api.addPoi(newPoiData);
      setIsAddPoiModalOpen(false);
      await loadData(); // Refresh data
    } catch (error) {
      console.error("Failed to save POI:", error);
      alert("Errore durante il salvataggio del Luogo.");
    }
  };

  const handleSaveCharacter = async (newCharacterData: Omit<Character, 'id'>) => {
     try {
      await api.addCharacter(newCharacterData);
      setIsAddCharacterModalOpen(false);
      await loadData(); // Refresh data
    } catch (error) {
      console.error("Failed to save Character:", error);
      alert("Errore durante il salvataggio del Personaggio.");
    }
  };

  const handleSaveItinerary = async (newItineraryData: Omit<Itinerary, 'id' | 'author'>) => {
    try {
      await api.addItinerary(newItineraryData);
      setIsAddItineraryModalOpen(false);
      await loadData(); // Refresh data
    } catch (error) {
      console.error("Failed to save Itinerary:", error);
      alert("Errore during il salvataggio dell'Itinerario.");
    }
  };
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error logging out:", error);
    }
  };

  if (!session) {
    return <LoginView />;
  }

  const renderView = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-screen"><p className="font-sans-display text-lg">Caricamento...</p></div>;
    }

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
            session={session}
            onLogout={handleLogout}
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
          characters={characters}
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