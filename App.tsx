import React, { useState, useEffect, useMemo } from 'react';
import { Poi, Itinerary, Character, Category, Point, Path, Area, User, Period } from './types';
import { supabase } from './services/supabaseClient';

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
  const [currentView, setCurrentView] = useState<View>('qui');
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [isAddPoiModalOpen, setIsAddPoiModalOpen] = useState(false);
  const [isAddCharacterModalOpen, setIsAddCharacterModalOpen] = useState(false);
  const [isAddItineraryModalOpen, setIsAddItineraryModalOpen] = useState(false);

  // Data states
  const [allPois, setAllPois] = useState<Poi[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch simple tables
        const { data: categoriesData, error: catError } = await supabase.from('categories').select('*');
        if (catError) throw catError;
        setCategories(categoriesData || []);

        const { data: periodsData, error: perError } = await supabase.from('periods').select('*');
        if (perError) throw perError;
        setPeriods(periodsData || []);
        
        const { data: charactersData, error: charError } = await supabase.from('characters').select('*');
        if (charError) throw charError;
        const transformedCharacters: Character[] = (charactersData || []).map(c => ({ ...c, wikipediaUrl: c.wikipedia_url }));
        setCharacters(transformedCharacters);

        const { data: profilesData, error: profError } = await supabase.from('profiles').select('*');
        if (profError) throw profError;
        const transformedUsers: User[] = (profilesData || []).map(p => ({ ...p, avatarUrl: p.avatar_url, contributions: 0 })); // Note: contributions are not in DB schema
        setUsers(transformedUsers);

        // Fetch POIs with relations
        const { data: poisData, error: poisError } = await supabase.from('pois').select(`*, profiles(name), poi_categories(categories(id)), poi_characters(characters(id))`);
        if (poisError) throw poisError;

        const transformedPois: Poi[] = (poisData || []).map((p: any) => {
            const basePoi = {
                id: p.id,
                creationDate: p.created_at,
                author: p.profiles?.name || 'Anonimo',
                periodId: p.period_id,
                categoryIds: p.poi_categories.map((pc: any) => pc.categories.id),
                title: p.title,
                location: p.location,
                eventDate: p.event_date,
                description: p.description,
                photos: p.photos || [],
                linkedCharacterIds: p.poi_characters.map((pch: any) => pch.characters.id),
                tags: p.tags || [],
            };
            switch (p.type) {
                case 'point': return { ...basePoi, type: 'point', coordinates: p.coordinates } as Point;
                case 'path': return { ...basePoi, type: 'path', pathCoordinates: p.path_coordinates } as Path;
                case 'area': return { ...basePoi, type: 'area', bounds: p.bounds } as Area;
                default: return null;
            }
        }).filter((p): p is Poi => p !== null);
        setAllPois(transformedPois);
        
        // Fetch Itineraries with relations
        const { data: itinerariesData, error: itError } = await supabase.from('itineraries').select(`*, profiles(name), itinerary_pois(poi_id)`);
        if (itError) throw itError;
        
        const transformedItineraries: Itinerary[] = (itinerariesData || []).map((it: any) => ({
            id: it.id,
            title: it.title,
            description: it.description,
            estimatedDuration: it.estimated_duration,
            poiIds: it.itinerary_pois.map((ip: any) => ip.poi_id),
            author: it.profiles?.name || 'Anonimo',
            tags: it.tags || [],
            coverPhoto: it.cover_photo,
        }));
        setItineraries(transformedItineraries);

      } catch (error) {
        console.error("Errore nel caricamento dati da Supabase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


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
    // TODO: Implement Supabase insert
    setIsAddPoiModalOpen(false);
  };

  const handleSaveCharacter = (newCharacter: Omit<Character, 'id'>) => {
    console.log("Saving new Character:", { ...newCharacter, id: `new_char_${Date.now()}` });
    // TODO: Implement Supabase insert
    setIsAddCharacterModalOpen(false);
  };

  const handleSaveItinerary = (newItinerary: Omit<Itinerary, 'id' | 'author'>) => {
    console.log("Saving new Itinerary:", { 
        ...newItinerary, 
        id: `new_it_${Date.now()}`,
        author: 'Mario Rossi'
    });
    // TODO: Implement Supabase insert
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#FAF7F0]">
        <h1 className="font-sans-display text-2xl font-bold text-[#2D3748]">Cosa è successo qui?</h1>
        <p className="font-serif-display text-lg text-gray-700 mt-2">Caricamento della memoria collettiva...</p>
      </div>
    );
  }

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