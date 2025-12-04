import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { Poi, Itinerary, Character, Category, User, Period, Photo, Coordinates } from './types';
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
import AddCategoryModal from './components/AddCategoryModal';
import AddPeriodModal from './components/AddPeriodModal';
import EditCategoryModal from './components/EditCategoryModal';
import EditPeriodModal from './components/EditPeriodModal';
import EditPoiModal from './components/EditPoiModal';
import EditCharacterModal from './components/EditCharacterModal';
import EditItineraryModal from './components/EditItineraryModal';

import BottomNav from './components/BottomNav';
import Toast from './components/Toast';


export type View = 'home' | 'qui' | 'itineraries' | 'search' | 'profile';

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('qui');
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [isAddPoiModalOpen, setIsAddPoiModalOpen] = useState(false);
  const [isAddCharacterModalOpen, setIsAddCharacterModalOpen] = useState(false);
  const [isAddItineraryModalOpen, setIsAddItineraryModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddPeriodModalOpen, setIsAddPeriodModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: string; data: any } | null>(null);
  
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Data states
  const [allPois, setAllPois] = useState<Poi[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const initialDataLoaded = useRef(false);
  
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);
  
  const attemptAnonymousSignIn = async () => {
    setConnectionError(null);
    setLoading(true);
    try {
      const { data: { session: newSession }, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      setSession(newSession);
    } catch (error: any) {
      console.error("Errore during il sign-in anonimo:", error);
      setConnectionError("Impossibile connettersi. Verifica la tua connessione a internet e riprova.");
    } finally {
      setSessionChecked(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setSessionChecked(true);
      } else {
        attemptAnonymousSignIn();
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
      
      const categoriesPromise = supabase.from('categories').select('*');
      const periodsPromise = supabase.from('periods').select('*');
      const charactersPromise = supabase.from('characters').select('*, photos(*)');
      const profilesPromise = supabase.from('profiles').select('*');
      const poisPromise = supabase.from('pois').select(`*, user_id, profiles:profiles!user_id(name), poi_categories(categories(id)), poi_characters(characters(id)), photos(*), user_poi_favorites(count)`);
      const itinerariesPromise = supabase.from('itineraries').select(`*, user_id, profiles:profiles!user_id(name), itinerary_pois(poi_id), coverPhoto:photos!cover_photo_id(*), user_itinerary_favorites(count)`);
      
      const { data: { user } } = await supabase.auth.getUser();

      const userPoiFavoritesPromise = user
          ? supabase.from('user_poi_favorites').select('poi_id').eq('user_id', user.id)
          : Promise.resolve({ data: [], error: null });

      const userItineraryFavoritesPromise = user
          ? supabase.from('user_itinerary_favorites').select('itinerary_id').eq('user_id', user.id)
          : Promise.resolve({ data: [], error: null });

      const [
          { data: categoriesData, error: catError },
          { data: periodsData, error: perError },
          { data: charactersData, error: charError },
          { data: profilesData, error: profError },
          { data: poisData, error: poisError },
          { data: itinerariesData, error: itError },
          { data: userPoiFavoritesData, error: userPoiFavoritesError },
          { data: userItineraryFavoritesData, error: userItineraryFavoritesError }
      ] = await Promise.all([categoriesPromise, periodsPromise, charactersPromise, profilesPromise, poisPromise, itinerariesPromise, userPoiFavoritesPromise, userItineraryFavoritesPromise]);

      if (catError) throw catError;
      if (perError) throw perError;
      if (charError) throw charError;
      if (profError) throw profError;
      if (poisError) throw poisError;
      if (itError) throw itError;
      if (userPoiFavoritesError) throw userPoiFavoritesError;
      if (userItineraryFavoritesError) throw userItineraryFavoritesError;
      
      const favoritePoiIds = new Set(userPoiFavoritesData?.map(fav => fav.poi_id) || []);
      const favoriteItineraryIds = new Set(userItineraryFavoritesData?.map(fav => fav.itinerary_id) || []);

      setCategories(categoriesData || []);
      setPeriods(periodsData || []);
      
      const mapPhotos = (p: any): Photo => ({
        id: p.id,
        url: p.url,
        caption: p.caption,
        coordinates: p.coordinates,
        location_author_id: p.location_author_id,
        location_set_at: p.location_set_at,
      });

      const transformedCharacters: Character[] = (charactersData || []).map(c => ({ 
        ...c, 
        wikipediaUrl: c.wikipedia_url,
        photos: (c.photos || []).map(mapPhotos)
      }));
      setCharacters(transformedCharacters);

      const transformedPois: Poi[] = (poisData || []).map((p: any) => ({
          id: p.id,
          creationDate: p.created_at,
          author: p.profiles?.name || 'Anonimo',
          periodId: p.period_id,
          categoryIds: (p.poi_categories || []).map((pc: any) => pc.categories.id),
          title: p.title,
          location: p.location,
          eventDate: p.event_date,
          description: p.description,
          photos: (p.photos || []).map(mapPhotos),
          linkedCharacterIds: (p.poi_characters || []).map((pch: any) => pch.characters.id),
          tags: p.tags || [],
          favoriteCount: p.user_poi_favorites[0]?.count || 0,
          isFavorited: favoritePoiIds.has(p.id),
          coordinates: p.coordinates,
      }));
      setAllPois(transformedPois);
      
      const transformedItineraries: Itinerary[] = (itinerariesData || []).map((it: any) => ({
          id: it.id,
          title: it.title,
          description: it.description,
          estimatedDuration: it.estimated_duration,
          poiIds: (it.itinerary_pois || []).map((ip: any) => ip.poi_id),
          author: it.profiles?.name || 'Anonimo',
          tags: it.tags || [],
          coverPhoto: it.coverPhoto ? { id: it.coverPhoto.id, url: it.coverPhoto.url, caption: it.coverPhoto.caption } : { id: '', url: 'https://placehold.co/600x400', caption: 'No image' },
          favoriteCount: it.user_itinerary_favorites[0]?.count || 0,
          isFavorited: favoriteItineraryIds.has(it.id),
      }));
      setItineraries(transformedItineraries);
      
      const contributions = new Map<string, number>();
      (poisData || []).forEach(p => {
        if (p.user_id) contributions.set(p.user_id, (contributions.get(p.user_id) || 0) + 1);
      });
      (charactersData || []).forEach(c => {
        if (c.user_id) contributions.set(c.user_id, (contributions.get(c.user_id) || 0) + 1);
      });
      (itinerariesData || []).forEach(i => {
        if (i.user_id) contributions.set(i.user_id, (contributions.get(i.user_id) || 0) + 1);
      });

      const transformedUsers: User[] = (profilesData || []).map(p => ({
        id: p.id,
        name: p.name,
        avatarUrl: p.avatar_url,
        contributions: contributions.get(p.id) || 0,
      }));
      setUsers(transformedUsers);


    } catch (error: any) {
      console.error("Errore nel caricamento dati da Supabase:", error);
      setConnectionError(`Errore nel caricamento dei dati: ${error.message}. Verifica le policy di Row Level Security (RLS) per le tabelle.`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (session && !initialDataLoaded.current) {
      initialDataLoaded.current = true;
      fetchData();
    } else if (sessionChecked && !initialDataLoaded.current) {
      setLoading(false);
    }
  }, [session, sessionChecked]);


  useEffect(() => {
    const isModalOpen = selectedPoi || selectedItinerary || selectedCharacter || selectedTag || isAddPoiModalOpen || isAddCharacterModalOpen || isAddItineraryModalOpen || isAddCategoryModalOpen || isAddPeriodModalOpen || editingItem;
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPoi, selectedItinerary, selectedCharacter, selectedTag, isAddPoiModalOpen, isAddCharacterModalOpen, isAddItineraryModalOpen, isAddCategoryModalOpen, isAddPeriodModalOpen, editingItem]);

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

  const handleToggleFavorite = async (poiId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setToast({ message: "Devi essere autenticato per aggiungere preferiti.", type: 'error' });
        return;
    }

    const originalPois = [...allPois];
    const targetPoi = originalPois.find(p => p.id === poiId);
    if (!targetPoi) return;

    // Optimistic UI Update
    const updatedPois = allPois.map(p => {
        if (p.id === poiId) {
            const isFavorited = !p.isFavorited;
            const favoriteCount = isFavorited ? p.favoriteCount + 1 : p.favoriteCount - 1;
            return { ...p, isFavorited, favoriteCount };
        }
        return p;
    });
    setAllPois(updatedPois);
    if (selectedPoi && selectedPoi.id === poiId) {
        setSelectedPoi(updatedPois.find(p => p.id === poiId) || null);
    }

    try {
        if (targetPoi.isFavorited) {
            const { error } = await supabase.from('user_poi_favorites').delete().match({ user_id: user.id, poi_id: poiId });
            if (error) throw error;
        } else {
            const { error } = await supabase.from('user_poi_favorites').insert({ user_id: user.id, poi_id: poiId });
            if (error) throw error;
        }
    } catch (error: any) {
        setAllPois(originalPois);
        if (selectedPoi && selectedPoi.id === poiId) setSelectedPoi(targetPoi);
        setToast({ message: `Errore: ${error.message}`, type: 'error' });
    }
  };
  
  const handleToggleItineraryFavorite = async (itineraryId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setToast({ message: "Devi essere autenticato per aggiungere preferiti.", type: 'error' });
        return;
    }

    const originalItineraries = [...itineraries];
    const targetItinerary = originalItineraries.find(i => i.id === itineraryId);
    if (!targetItinerary) return;

    // Optimistic UI Update
    const updatedItineraries = itineraries.map(i => {
        if (i.id === itineraryId) {
            const isFavorited = !i.isFavorited;
            const favoriteCount = isFavorited ? i.favoriteCount + 1 : i.favoriteCount - 1;
            return { ...i, isFavorited, favoriteCount };
        }
        return i;
    });
    setItineraries(updatedItineraries);
    if (selectedItinerary && selectedItinerary.id === itineraryId) {
        setSelectedItinerary(updatedItineraries.find(i => i.id === itineraryId) || null);
    }

    try {
        if (targetItinerary.isFavorited) {
            const { error } = await supabase.from('user_itinerary_favorites').delete().match({ user_id: user.id, itinerary_id: itineraryId });
            if (error) throw error;
        } else {
            const { error } = await supabase.from('user_itinerary_favorites').insert({ user_id: user.id, itinerary_id: itineraryId });
            if (error) throw error;
        }
    } catch (error: any) {
        setItineraries(originalItineraries);
        if (selectedItinerary && selectedItinerary.id === itineraryId) setSelectedItinerary(targetItinerary);
        setToast({ message: `Errore: ${error.message}`, type: 'error' });
    }
  };
  
  const handleSavePoi = async (
    newPoiData: Omit<Poi, 'id' | 'creationDate' | 'author' | 'photos' | 'favoriteCount' | 'isFavorited'>,
    photosToUpload: { file: File; caption: string, coordinates?: Coordinates | null }[],
    urlPhotos: { url: string; caption: string, coordinates?: Coordinates | null }[]
  ) => {
      try {
          const poiToInsert: any = {
              title: newPoiData.title,
              description: newPoiData.description,
              location: newPoiData.location,
              event_date: newPoiData.eventDate,
              period_id: newPoiData.periodId,
              tags: newPoiData.tags,
              user_id: TEST_USER_ID,
              coordinates: newPoiData.coordinates,
          };

          const { data: poiData, error: poiError } = await supabase.from('pois').insert(poiToInsert).select().single();
          if (poiError) throw poiError;
          const newPoiId = poiData.id;

          let allNewPhotos: { url: string; caption: string; poi_id: string, coordinates?: Coordinates | null }[] = [];

          if (urlPhotos.length > 0) {
              allNewPhotos = urlPhotos.map(p => ({ ...p, poi_id: newPoiId }));
          }

          if (photosToUpload.length > 0) {
            const photoUploadPromises = photosToUpload.map(async (photo) => {
              const sanitizedFileName = photo.file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
              const fileName = `${Date.now()}_${sanitizedFileName}`;
              const filePath = `pois/${fileName}`;
              
              const { error: uploadError } = await supabase.storage.from('media').upload(filePath, photo.file);
              if (uploadError) throw uploadError;

              const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
              
              return { url: publicUrl, caption: photo.caption, poi_id: newPoiId, coordinates: photo.coordinates };
            });
            const uploadedPhotosData = await Promise.all(photoUploadPromises);
            allNewPhotos = [...allNewPhotos, ...uploadedPhotosData];
          }

          if (allNewPhotos.length > 0) {
            const photosToInsert = allNewPhotos.map(p => {
              const photoData: any = { ...p };
              if (p.coordinates) {
                  photoData.location_author_id = TEST_USER_ID;
                  photoData.location_set_at = new Date().toISOString();
              }
              return photoData;
            });
            const { error: photosInsertError } = await supabase.from('photos').insert(photosToInsert);
            if (photosInsertError) throw photosInsertError;
          }

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

          setToast({ message: "Luogo salvato con successo!", type: 'success' });
          setIsAddPoiModalOpen(false);
          await fetchData();
      } catch (error: any) {
          console.error("Errore nel salvataggio del POI:", error);
          setToast({ message: `Errore nel salvataggio: ${error.message}`, type: 'error' });
      }
  };

  const handleSaveCharacter = async (
    newCharacterData: Omit<Character, 'id' | 'photos'>,
    photosToUpload: { file: File; caption: string, coordinates?: Coordinates | null }[],
    urlPhotos: { url: string; caption: string, coordinates?: Coordinates | null }[]
  ) => {
      try {
          const { data: charData, error: charError } = await supabase.from('characters').insert({
              name: newCharacterData.name,
              description: newCharacterData.description,
              wikipedia_url: newCharacterData.wikipediaUrl,
              user_id: TEST_USER_ID,
          }).select().single();
          if (charError) throw charError;
          const newCharId = charData.id;

          let allNewPhotos: { url: string; caption: string; character_id: string, coordinates?: Coordinates | null }[] = [];

          if (urlPhotos.length > 0) {
              allNewPhotos = urlPhotos.map(p => ({ ...p, character_id: newCharId }));
          }

          if (photosToUpload.length > 0) {
            const photoUploadPromises = photosToUpload.map(async (photo) => {
                const sanitizedFileName = photo.file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
                const fileName = `${Date.now()}_${sanitizedFileName}`;
                const filePath = `characters/${fileName}`;

                const { error: uploadError } = await supabase.storage.from('media').upload(filePath, photo.file);
                if (uploadError) throw uploadError;
                
                const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
                return { url: publicUrl, caption: photo.caption, character_id: newCharId, coordinates: photo.coordinates };
            });
            const uploadedPhotosData = await Promise.all(photoUploadPromises);
            allNewPhotos = [...allNewPhotos, ...uploadedPhotosData];
          }

          if (allNewPhotos.length > 0) {
            const photosToInsert = allNewPhotos.map(p => {
              const photoData: any = { ...p };
              if (p.coordinates) {
                  photoData.location_author_id = TEST_USER_ID;
                  photoData.location_set_at = new Date().toISOString();
              }
              return photoData;
            });
            const { error: photosInsertError } = await supabase.from('photos').insert(photosToInsert);
            if(photosInsertError) throw photosInsertError;
          }

          setToast({ message: "Personaggio salvato con successo!", type: 'success' });
          setIsAddCharacterModalOpen(false);
          await fetchData();
      } catch (error: any) {
          console.error("Errore nel salvataggio del Personaggio:", error);
          setToast({ message: `Errore nel salvataggio: ${error.message}`, type: 'error' });
      }
  };

  const handleSaveItinerary = async (
    newItineraryData: Omit<Itinerary, 'id' | 'author' | 'coverPhoto' | 'favoriteCount' | 'isFavorited'>,
    coverPhotoFile: File | null
  ) => {
     try {
        if (!coverPhotoFile) {
          setToast({ message: "È necessaria una foto di copertina.", type: 'error' });
          return;
        }

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

        const itineraryToInsert = {
            title: newItineraryData.title,
            description: newItineraryData.description,
            estimated_duration: newItineraryData.estimatedDuration,
            tags: newItineraryData.tags,
            cover_photo_id: coverPhotoId,
            user_id: TEST_USER_ID,
        };

        const { data: itineraryData, error: itError } = await supabase.from('itineraries').insert(itineraryToInsert).select().single();
        if (itError) throw itError;
        const newItineraryId = itineraryData.id;

        if (newItineraryData.poiIds.length > 0) {
            const itineraryPois = newItineraryData.poiIds.map(poiId => ({ itinerary_id: newItineraryId, poi_id: poiId }));
            const { error: itPoisError } = await supabase.from('itinerary_pois').insert(itineraryPois);
            if (itPoisError) throw itPoisError;
        }

        setToast({ message: "Itinerario salvato con successo!", type: 'success' });
        setIsAddItineraryModalOpen(false);
        await fetchData();
    } catch (error: any) {
        console.error("Errore nel salvataggio dell'Itinerario:", error);
        setToast({ message: `Errore nel salvataggio: ${error.message}`, type: 'error' });
    }
  };
  
  const handleSaveCategory = async (name: string) => {
    try {
      const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-');
      const { error } = await supabase.from('categories').insert({ id, name });
      if (error) throw error;
      setToast({ message: "Categoria salvata con successo!", type: 'success' });
      setIsAddCategoryModalOpen(false);
      await fetchData();
    } catch (error: any) {
      console.error("Errore nel salvataggio della Categoria:", error);
      setToast({ message: `Errore nel salvataggio: ${error.message}`, type: 'error' });
    }
  };

  const handleSavePeriod = async (name: string, start_year: number, end_year: number) => {
    try {
      const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-');
      const { error } = await supabase.from('periods').insert({ id, name, start_year, end_year });
      if (error) throw error;
      setToast({ message: "Periodo salvato con successo!", type: 'success' });
      setIsAddPeriodModalOpen(false);
      await fetchData();
    } catch (error: any) {
      console.error("Errore nel salvataggio del Periodo:", error);
      setToast({ message: `Errore nel salvataggio: ${error.message}`, type: 'error' });
    }
  };

  const handleDelete = async (table: string, id: string, name: string) => {
    if (window.confirm(`Sei sicuro di voler eliminare "${name}"? Questa azione è irreversibile.`)) {
      try {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        setToast({ message: "Elemento eliminato con successo.", type: 'success' });
        await fetchData();
      } catch (error: any) {
        console.error(`Errore nell'eliminazione da ${table}:`, error);
        setToast({ message: `Errore di eliminazione: ${error.message}`, type: 'error' });
      }
    }
  };

  const handleModify = (type: string, data: any) => {
    setSelectedPoi(null);
    setSelectedCharacter(null);
    setSelectedItinerary(null);
    setEditingItem({ type, data });
  };
  
  const handleUpdateCategory = async (id: string, name: string) => {
    try {
        const { error } = await supabase.from('categories').update({ name }).eq('id', id);
        if (error) throw error;
        setToast({ message: "Categoria aggiornata con successo!", type: 'success' });
        setEditingItem(null);
        await fetchData();
    } catch (error: any) {
        console.error("Errore nell'aggiornamento della Categoria:", error);
        setToast({ message: `Errore di aggiornamento: ${error.message}`, type: 'error' });
    }
  };

  const handleUpdatePeriod = async (id: string, name: string, start_year: number, end_year: number) => {
    try {
        const { error } = await supabase.from('periods').update({ name, start_year, end_year }).eq('id', id);
        if (error) throw error;
        setToast({ message: "Periodo aggiornato con successo!", type: 'success' });
        setEditingItem(null);
        await fetchData();
    } catch (error: any) {
        console.error("Errore nell'aggiornamento del Periodo:", error);
        setToast({ message: `Errore di aggiornamento: ${error.message}`, type: 'error' });
    }
  };

  const handleUpdatePoi = async (
    poiId: string,
    updatedData: Omit<Poi, 'id' | 'creationDate' | 'author' | 'photos' | 'favoriteCount' | 'isFavorited'>,
    photosToUpload: { file: File; caption: string, coordinates?: Coordinates | null }[],
    photosToDelete: Photo[],
    newUrlPhotos: { url: string; caption: string, coordinates?: Coordinates | null }[],
    updatedExistingPhotos: Photo[]
  ) => {
      try {
          const poiToUpdate: any = {
              title: updatedData.title,
              description: updatedData.description,
              location: updatedData.location,
              event_date: updatedData.eventDate,
              period_id: updatedData.periodId,
              tags: updatedData.tags,
              coordinates: updatedData.coordinates,
          };

          const { error: poiError } = await supabase.from('pois').update(poiToUpdate).eq('id', poiId);
          if (poiError) throw poiError;

          await supabase.from('poi_categories').delete().eq('poi_id', poiId);
          if (updatedData.categoryIds.length > 0) {
              const poiCategories = updatedData.categoryIds.map(catId => ({ poi_id: poiId, category_id: catId }));
              const { error: catError } = await supabase.from('poi_categories').insert(poiCategories);
              if (catError) throw catError;
          }

          await supabase.from('poi_characters').delete().eq('poi_id', poiId);
          if (updatedData.linkedCharacterIds.length > 0) {
              const poiCharacters = updatedData.linkedCharacterIds.map(charId => ({ poi_id: poiId, character_id: charId }));
              const { error: charError } = await supabase.from('poi_characters').insert(poiCharacters);
              if (charError) throw charError;
          }

          if (photosToDelete.length > 0) {
              const photoIds = photosToDelete.map(p => p.id);
              const filePaths = photosToDelete.map(p => new URL(p.url).pathname.split('/media/').pop() || '').filter(Boolean);
              
              const { error: dbError } = await supabase.from('photos').delete().in('id', photoIds);
              if (dbError) throw dbError;

              if (filePaths.length > 0) {
                const { error: storageError } = await supabase.storage.from('media').remove(filePaths);
                if (storageError) console.warn("Errore eliminazione file dallo storage:", storageError.message);
              }
          }
          
          let allNewPhotos: { url: string; caption: string; poi_id: string, coordinates?: Coordinates | null }[] = [];

          if (newUrlPhotos.length > 0) {
              allNewPhotos = newUrlPhotos.map(p => ({ ...p, poi_id: poiId }));
          }

          if (photosToUpload.length > 0) {
            const photoUploadPromises = photosToUpload.map(async (photo) => {
              const sanitizedFileName = photo.file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
              const fileName = `${Date.now()}_${sanitizedFileName}`;
              const filePath = `pois/${fileName}`;
              
              await supabase.storage.from('media').upload(filePath, photo.file);
              const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
              
              return { url: publicUrl, caption: photo.caption, poi_id: poiId, coordinates: photo.coordinates };
            });
            const uploadedPhotosData = await Promise.all(photoUploadPromises);
            allNewPhotos = [...allNewPhotos, ...uploadedPhotosData];
          }

          if (allNewPhotos.length > 0) {
              const photosToInsert = allNewPhotos.map(p => {
                const photoData: any = { ...p };
                if (p.coordinates) {
                    photoData.location_author_id = TEST_USER_ID;
                    photoData.location_set_at = new Date().toISOString();
                }
                return photoData;
              });
              await supabase.from('photos').insert(photosToInsert);
          }
          
          if (updatedExistingPhotos) {
              const originalPoi = editingItem?.data as Poi;
              if (!originalPoi) throw new Error("Original POI data not found for comparison.");

              const updatePromises = updatedExistingPhotos.map(p => {
                  const originalPhoto = originalPoi.photos.find(op => op.id === p.id);
                  const updatePayload: any = { caption: p.caption, coordinates: p.coordinates || null };
                  const coordsChanged = JSON.stringify(p.coordinates) !== JSON.stringify(originalPhoto?.coordinates);
                  
                  if (coordsChanged) {
                      if (p.coordinates) {
                          updatePayload.location_author_id = TEST_USER_ID;
                          updatePayload.location_set_at = new Date().toISOString();
                      } else {
                          updatePayload.location_author_id = null;
                          updatePayload.location_set_at = null;
                      }
                  }
                  return supabase.from('photos').update(updatePayload).eq('id', p.id);
              });
              await Promise.all(updatePromises);
          }

          setToast({ message: "Luogo aggiornato con successo!", type: 'success' });
          setEditingItem(null);
          await fetchData();
      } catch (error: any) {
          console.error("Errore nell'aggiornamento del POI:", error);
          setToast({ message: `Errore durante l'aggiornamento: ${error.message}`, type: 'error' });
      }
  };

  const handleUpdateCharacter = async (
    charId: string,
    updatedData: Omit<Character, 'id' | 'photos'>,
    photosToUpload: { file: File; caption: string, coordinates?: Coordinates | null }[],
    photosToDelete: Photo[],
    newUrlPhotos: { url: string; caption: string, coordinates?: Coordinates | null }[],
    updatedExistingPhotos: Photo[]
  ) => {
      try {
          await supabase.from('characters').update({
              name: updatedData.name,
              description: updatedData.description,
              wikipedia_url: updatedData.wikipediaUrl
          }).eq('id', charId);

          if (photosToDelete.length > 0) {
              const photoIds = photosToDelete.map(p => p.id);
              const filePaths = photosToDelete.map(p => new URL(p.url).pathname.split('/media/').pop() || '').filter(Boolean);
              await supabase.from('photos').delete().in('id', photoIds);
              if (filePaths.length > 0) {
                await supabase.storage.from('media').remove(filePaths);
              }
          }
          
          let allNewPhotos: { url: string; caption: string; character_id: string, coordinates?: Coordinates | null }[] = [];

          if (newUrlPhotos.length > 0) {
              allNewPhotos = newUrlPhotos.map(p => ({ ...p, character_id: charId }));
          }

          if (photosToUpload.length > 0) {
            const photoUploadPromises = photosToUpload.map(async (photo) => {
                const sanitizedFileName = photo.file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
                const fileName = `${Date.now()}_${sanitizedFileName}`;
                const filePath = `characters/${fileName}`;
                await supabase.storage.from('media').upload(filePath, photo.file);
                const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
                return { url: publicUrl, caption: photo.caption, character_id: charId, coordinates: photo.coordinates };
            });
            const uploadedPhotosData = await Promise.all(photoUploadPromises);
            allNewPhotos = [...allNewPhotos, ...uploadedPhotosData];
          }
          
          if(allNewPhotos.length > 0) {
              const photosToInsert = allNewPhotos.map(p => {
                const photoData: any = { ...p };
                if (p.coordinates) {
                    photoData.location_author_id = TEST_USER_ID;
                    photoData.location_set_at = new Date().toISOString();
                }
                return photoData;
              });
              await supabase.from('photos').insert(photosToInsert);
          }
          
          if (updatedExistingPhotos) {
            const originalCharacter = editingItem?.data as Character;
            if (!originalCharacter) throw new Error("Original Character data not found for comparison.");

            const updatePromises = updatedExistingPhotos.map(p => {
                const originalPhoto = originalCharacter.photos.find(op => op.id === p.id);
                const updatePayload: any = { caption: p.caption, coordinates: p.coordinates || null };
                const coordsChanged = JSON.stringify(p.coordinates) !== JSON.stringify(originalPhoto?.coordinates);
                
                if (coordsChanged) {
                    if (p.coordinates) {
                        updatePayload.location_author_id = TEST_USER_ID;
                        updatePayload.location_set_at = new Date().toISOString();
                    } else {
                        updatePayload.location_author_id = null;
                        updatePayload.location_set_at = null;
                    }
                }
                return supabase.from('photos').update(updatePayload).eq('id', p.id);
            });
            await Promise.all(updatePromises);
          }

          setToast({ message: "Personaggio aggiornato con successo!", type: 'success' });
          setEditingItem(null);
          await fetchData();
      } catch (error: any) {
          console.error("Errore nell'aggiornamento del Personaggio:", error);
          setToast({ message: `Errore durante l'aggiornamento: ${error.message}`, type: 'error' });
      }
  };

  const handleUpdateItinerary = async (
    itineraryId: string,
    updatedData: Omit<Itinerary, 'id' | 'author' | 'coverPhoto' | 'favoriteCount' | 'isFavorited'>,
    coverPhotoFile: File | null
  ) => {
      try {
          let coverPhotoId = editingItem?.data.coverPhoto.id;

          if (coverPhotoFile) {
              const oldPhotoPath = new URL(editingItem?.data.coverPhoto.url).pathname.split('/media/').pop();
              if (oldPhotoPath && editingItem?.data.coverPhoto.url.includes('supabase')) {
                  await supabase.storage.from('media').remove([oldPhotoPath]);
                  await supabase.from('photos').delete().eq('id', coverPhotoId);
              }

              const sanitizedFileName = coverPhotoFile.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
              const fileName = `${Date.now()}_${sanitizedFileName}`;
              const filePath = `itineraries/${fileName}`;
              await supabase.storage.from('media').upload(filePath, coverPhotoFile);
              const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);

              const { data: photoData, error: photoInsertError } = await supabase.from('photos').insert({
                url: publicUrl,
                caption: `Cover for ${updatedData.title}`
              }).select().single();
              if (photoInsertError) throw photoInsertError;
              coverPhotoId = photoData.id;
          }

          await supabase.from('itineraries').update({
              title: updatedData.title,
              description: updatedData.description,
              estimated_duration: updatedData.estimatedDuration,
              tags: updatedData.tags,
              cover_photo_id: coverPhotoId,
          }).eq('id', itineraryId);

          await supabase.from('itinerary_pois').delete().eq('itinerary_id', itineraryId);
          if (updatedData.poiIds.length > 0) {
              const itineraryPois = updatedData.poiIds.map(poiId => ({ itinerary_id: itineraryId, poi_id: poiId }));
              await supabase.from('itinerary_pois').insert(itineraryPois);
          }
          
          setToast({ message: "Itinerario aggiornato con successo!", type: 'success' });
          setEditingItem(null);
          await fetchData();
      } catch (error: any) {
          console.error("Errore nell'aggiornamento dell'Itinerario:", error);
          setToast({ message: `Errore durante l'aggiornamento: ${error.message}`, type: 'error' });
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
          categories={categories}
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
            onAddCategoryClick={() => setIsAddCategoryModalOpen(true)}
            onAddPeriodClick={() => setIsAddPeriodModalOpen(true)}
            onDelete={handleDelete}
            onModify={handleModify}
            pois={allPois}
            characters={characters}
            itineraries={itineraries}
            categories={categories}
            periods={periods}
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
            <button
              onClick={attemptAnonymousSignIn}
              className="mt-4 px-4 py-2 bg-red-600 text-white font-sans-display font-semibold rounded-md hover:bg-red-700 transition-colors"
            >
              Riprova
            </button>
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
          onToggleFavorite={handleToggleFavorite}
          onModify={handleModify}
          onDelete={handleDelete}
        />
      )}
      {selectedItinerary && (
        <ItineraryDetailModal
          itinerary={selectedItinerary}
          allPois={allPois}
          onClose={() => setSelectedItinerary(null)}
          onSelectPoiInItinerary={openPoiModal}
          onSelectTag={openTagModal}
          onToggleFavorite={handleToggleItineraryFavorite}
          onModify={handleModify}
          onDelete={handleDelete}
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
          onModify={handleModify}
          onDelete={handleDelete}
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
      {isAddCategoryModalOpen && (
        <AddCategoryModal
          onClose={() => setIsAddCategoryModalOpen(false)}
          onSave={handleSaveCategory}
        />
      )}
      {isAddPeriodModalOpen && (
        <AddPeriodModal
          onClose={() => setIsAddPeriodModalOpen(false)}
          onSave={handleSavePeriod}
        />
      )}
      {editingItem?.type === 'category' && (
        <EditCategoryModal
          onClose={() => setEditingItem(null)}
          onSave={handleUpdateCategory}
          category={editingItem.data}
        />
      )}
      {editingItem?.type === 'period' && (
        <EditPeriodModal
          onClose={() => setEditingItem(null)}
          onSave={handleUpdatePeriod}
          period={editingItem.data}
        />
      )}
      {editingItem?.type === 'poi' && (
        <EditPoiModal
          onClose={() => setEditingItem(null)}
          onSave={handleUpdatePoi}
          poi={editingItem.data}
          categories={categories}
          periods={periods}
          characters={characters}
        />
      )}
      {editingItem?.type === 'character' && (
        <EditCharacterModal
          onClose={() => setEditingItem(null)}
          onSave={handleUpdateCharacter}
          character={editingItem.data}
        />
      )}
      {editingItem?.type === 'itinerary' && (
        <EditItineraryModal
          onClose={() => setEditingItem(null)}
          onSave={handleUpdateItinerary}
          itinerary={editingItem.data}
          allPois={allPois}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;
