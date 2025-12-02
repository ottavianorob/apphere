import React, { useState, useEffect, useMemo } from 'react';
import { Session } from '@supabase/supabase-js';
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
  
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setSessionChecked(true);
      } else {
        supabase.auth.signInAnonymously().then(({ data: { session: newSession }, error }) => {
            if (error) {
                console.error("Errore durante il sign-in anonimo:", error);
                setConnectionError("Impossibile stabilire una sessione utente anonima. Verifica che l'autenticazione anonima sia abilitata nelle impostazioni del tuo progetto Supabase.");
            } else {
                setSession(newSession);
            }
            setSessionChecked(true);
        });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      // Fetch simple tables
      const { data: categoriesData, error: catError } = await supabase.from('categories').select('*');
      if (catError) throw catError;
      setCategories(categoriesData || []);

      const { data: periodsData, error: perError } = await supabase.from('periods').select('*');
      if (perError) throw perError;
      setPeriods(periodsData || []);
      
      const { data: charactersData, error: charError } = await supabase.from('characters').select('*, photos(*)');
      if (charError) throw charError;
      const transformedCharacters: Character[] = (charactersData || []).map(c => ({ 
        ...c, 
        wikipediaUrl: c.wikipedia_url,
        photos: c.photos.map((p: any) => ({ id: p.id, url: p.url, caption: p.caption }))
      }));
      setCharacters(transformedCharacters);

      const { data: profilesData, error: profError } = await supabase.from('profiles').select('*');
      if (profError) throw profError;
      const transformedUsers: User[] = (profilesData || []).map(p => ({ ...p, avatarUrl: p.avatar_url, contributions: 0 })); // Note: contributions are not in DB schema
      setUsers(transformedUsers);

      // Fetch POIs with relations
      const { data: poisData, error: poisError } = await supabase.from('pois').select(`*, profiles:profiles!user_id(name), poi_categories(categories(id)), poi_characters(characters(id)), photos(*)`);
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
              photos: p.photos.map((ph: any) => ({ id: ph.id, url: ph.url, caption: ph.caption })) || [],
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
      const { data: itinerariesData, error: itError } = await supabase.from('itineraries').select(`*, profiles:profiles!user_id(name), itinerary_pois(poi_id), coverPhoto:photos!cover_photo_id(*)`);
      if (itError) throw itError;
      
      const transformedItineraries: Itinerary[] = (itinerariesData || []).map((it: any) => ({
          id: it.id,
          title: it.title,
          description: it.description,
          estimatedDuration: it.estimated_duration,
          poiIds: it.itinerary_pois.map((ip: any) => ip.poi_id),
          author: it.profiles?.name || 'Anonimo',
          tags: it.tags || [],
          coverPhoto: it.coverPhoto ? { id: it.coverPhoto.id, url: it.coverPhoto.url, caption: it.coverPhoto.caption } : { id: '', url: 'https://placehold.co/600x400', caption: 'No image' },
      }));
      setItineraries(transformedItineraries);

    } catch (error: any) {
      console.error("Errore nel caricamento dati da Supabase:", error);
      setConnectionError(`Errore nel caricamento dei dati: ${error.message}. Verifica le policy di Row Level Security (RLS) per le tabelle.`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (session) {
      fetchData();
    } else if (sessionChecked) {
      // Session check is done, but we have no session (e.g. sign-in failed)
      setLoading(false);
    }
  }, [session, sessionChecked]);


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
  
  const handleSavePoi = async (
    newPoiData: Omit<Poi, 'id' | 'creationDate' | 'author' | 'photos'>,
    photosToUpload: { file: File; caption: string }[]
  ) => {
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
              alert("Sessione non valida. Ricarica la pagina.");
              return;
          }

          // 1. Insert POI data without photos, including user_id
          const poiToInsert: any = {
              title: newPoiData.title,
              description: newPoiData.description,
              location: newPoiData.location,
              event_date: newPoiData.eventDate,
              period_id: newPoiData.periodId,
              tags: newPoiData.tags,
              type: newPoiData.type,
              user_id: user.id, // Aggiunto user_id
          };
          if (newPoiData.type === 'point') poiToInsert.coordinates = (newPoiData as Point).coordinates;
          if (newPoiData.type === 'path') poiToInsert.path_coordinates = (newPoiData as Path).pathCoordinates;
          if (newPoiData.type === 'area') poiToInsert.bounds = (newPoiData as Area).bounds;

          const { data: poiData, error: poiError } = await supabase.from('pois').insert(poiToInsert).select().single();
          if (poiError) throw poiError;
          const newPoiId = poiData.id;

          // 2. Upload photos and insert into photos table
          if (photosToUpload.length > 0) {
            const photoUploadPromises = photosToUpload.map(async (photo) => {
              const sanitizedFileName = photo.file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
              const fileName = `${Date.now()}_${sanitizedFileName}`;
              const filePath = `pois/${fileName}`;
              
              const { error: uploadError } = await supabase.storage.from('media').upload(filePath, photo.file);
              if (uploadError) throw uploadError;

              const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
              
              return {
                url: publicUrl,
                caption: photo.caption,
                poi_id: newPoiId
              };
            });

            const newPhotos = await Promise.all(photoUploadPromises);
            const { error: photosInsertError } = await supabase.from('photos').insert(newPhotos);
            if (photosInsertError) throw photosInsertError;
          }

          // 3. Link categories and characters
          if (newPoiData.categoryIds.length > 0) {
              const poiCategories = newPoiData.categoryIds.map(catId => ({ poi_id: newPoiId, category_id: catId }));
              const { error: catError } = await supabase.from('poi_categories').insert(poiCategories);
              if (catError) throw catError;
          }

          if (newPoiData.linkedCharacterIds.length > 0) {
              const poiCharacters = newPoiData.linkedCharacterIds.map(charId => ({ poi_id: newPoiId, character_id: charId }));
              const { error: charError } = await supabase.from('poi_characters').insert(poiCharacters);
              if (charError) throw charError;
          }

          alert("Luogo salvato con successo!");
          setIsAddPoiModalOpen(false);
          await fetchData();
      } catch (error) {
          console.error("Errore nel salvataggio del POI:", error);
          alert("Si è verificato un errore durante il salvataggio.");
      }
  };

  const handleSaveCharacter = async (
    newCharacterData: Omit<Character, 'id' | 'photos'>,
    photosToUpload: { file: File; caption: string }[]
  ) => {
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
              alert("Sessione non valida. Ricarica la pagina.");
              return;
          }

          // 1. Insert character data
          const { data: charData, error: charError } = await supabase.from('characters').insert({
              name: newCharacterData.name,
              description: newCharacterData.description,
              wikipedia_url: newCharacterData.wikipediaUrl,
              user_id: user.id, // Aggiunto user_id
          }).select().single();
          if (charError) throw charError;
          const newCharId = charData.id;

          // 2. Upload photos and link them
          if (photosToUpload.length > 0) {
            const photoUploadPromises = photosToUpload.map(async (photo) => {
                const sanitizedFileName = photo.file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
                const fileName = `${Date.now()}_${sanitizedFileName}`;
                const filePath = `characters/${fileName}`;

                const { error: uploadError } = await supabase.storage.from('media').upload(filePath, photo.file);
                if (uploadError) throw uploadError;
                
                const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
                return {
                  url: publicUrl,
                  caption: photo.caption,
                  character_id: newCharId,
                };
            });

            const newPhotos = await Promise.all(photoUploadPromises);
            const { error: photosInsertError } = await supabase.from('photos').insert(newPhotos);
            if(photosInsertError) throw photosInsertError;
          }

          alert("Personaggio salvato con successo!");
          setIsAddCharacterModalOpen(false);
          await fetchData();
      } catch (error) {
          console.error("Errore nel salvataggio del Personaggio:", error);
          alert("Si è verificato un errore durante il salvataggio.");
      }
  };

  const handleSaveItinerary = async (
    newItineraryData: Omit<Itinerary, 'id' | 'author' | 'coverPhoto'>,
    coverPhotoFile: File | null
  ) => {
     try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("Sessione non valida. Ricarica la pagina.");
            return;
        }

        if (!coverPhotoFile) {
          alert("È necessaria una foto di copertina.");
          return;
        }

        // 1. Upload cover photo and insert it into photos table
        const sanitizedFileName = coverPhotoFile.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
        const fileName = `${Date.now()}_${sanitizedFileName}`;
        const filePath = `itineraries/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('media').upload(filePath, coverPhotoFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);

        const { data: photoData, error: photoInsertError } = await supabase.from('photos').insert({
          url: publicUrl,
          caption: `Cover for ${newItineraryData.title}`
        }).select().single();
        if (photoInsertError) throw photoInsertError;
        const coverPhotoId = photoData.id;

        // 2. Insert itinerary with the cover photo id and user_id
        const itineraryToInsert = {
            title: newItineraryData.title,
            description: newItineraryData.description,
            estimated_duration: newItineraryData.estimatedDuration,
            tags: newItineraryData.tags,
            cover_photo_id: coverPhotoId,
            user_id: user.id, // Aggiunto user_id
        };

        const { data: itineraryData, error: itError } = await supabase.from('itineraries').insert(itineraryToInsert).select().single();
        if (itError) throw itError;
        const newItineraryId = itineraryData.id;

        // 3. Link POIs
        if (newItineraryData.poiIds.length > 0) {
            const itineraryPois = newItineraryData.poiIds.map(poiId => ({ itinerary_id: newItineraryId, poi_id: poiId }));
            const { error: itPoisError } = await supabase.from('itinerary_pois').insert(itineraryPois);
            if (itPoisError) throw itPoisError;
        }

        alert("Itinerario salvato con successo!");
        setIsAddItineraryModalOpen(false);
        await fetchData();
    } catch (error) {
        console.error("Errore nel salvataggio dell'Itinerario:", error);
        alert("Si è verificato un errore durante il salvataggio.");
    }
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
            pois={allPois}
            characters={characters}
            itineraries={itineraries}
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

  if (!sessionChecked || loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#FAF7F0] p-4 text-center">
        <h1 className="font-sans-display text-2xl font-bold text-[#2D3748]">Cosa è successo qui?</h1>
        {connectionError ? (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md max-w-lg">
            <p className="font-bold font-sans-display">Errore di Connessione</p>
            <p className="text-sm mt-2 font-serif-display">{connectionError}</p>
          </div>
        ) : (
          <p className="font-serif-display text-lg text-gray-700 mt-2">Caricamento della memoria collettiva...</p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-6 pb-24">
        {connectionError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
              <p className="font-bold">Si è verificato un errore</p>
              <p>{connectionError}</p>
            </div>
        )}
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