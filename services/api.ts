import { supabase } from './supabaseClient';
import { Poi, Itinerary, Character, Category, User, Period } from '../types';

// Data Transformation Utilities
const transformPoiData = (data: any[]): Poi[] => {
    return data.map(p => {
        const basePoi = {
            id: p.id,
            type: p.type,
            creationDate: p.created_at,
            author: p.profiles?.name || 'Utente Sconosciuto',
            periodId: p.period_id,
            categoryIds: p.poi_categories?.map((pc: any) => pc.categories?.id).filter(Boolean) || [],
            title: p.title,
            location: p.location,
            eventDate: p.event_date,
            description: p.description,
            photos: p.photos || [],
            linkedCharacterIds: p.poi_characters?.map((pc: any) => pc.characters?.id).filter(Boolean) || [],
            tags: p.tags || [],
        };

        if (p.type === 'point') {
            if (!p.coordinates) return null; // Filter out invalid points
            return {
                ...basePoi,
                type: 'point',
                coordinates: p.coordinates,
            };
        }
        if (p.type === 'path') {
            if (!p.path_coordinates || p.path_coordinates.length === 0) return null;
            return {
                ...basePoi,
                type: 'path',
                pathCoordinates: p.path_coordinates,
            };
        }
        if (p.type === 'area') {
            if (!p.bounds || p.bounds.length === 0) return null;
            return {
                ...basePoi,
                type: 'area',
                bounds: p.bounds,
            };
        }
        return null; // Should not happen with correct data
    }).filter(Boolean) as Poi[];
};

const transformItineraryData = (data: any[]): Itinerary[] => {
    return data.map(it => ({
        id: it.id,
        title: it.title,
        description: it.description,
        tags: it.tags || [],
        author: it.profiles?.name || 'Utente Sconosciuto',
        estimatedDuration: it.estimated_duration,
        coverPhoto: it.cover_photo || { id: 'placeholder', url: 'https://picsum.photos/seed/placeholder/800/600', caption: 'Nessuna immagine di copertina' },
        poiIds: (it.itinerary_pois || [])
            .sort((a: any, b: any) => a.order - b.order)
            .map((ip: any) => ip.poi_id),
    }));
};

// Fetch Functions
export const fetchPois = async (): Promise<Poi[]> => {
    const { data, error } = await supabase
        .from('pois')
        .select(`
            *,
            profiles (name),
            poi_categories ( categories (id) ),
            poi_characters ( characters (id) )
        `);
    if (error) throw error;
    return transformPoiData(data || []);
};

export const fetchItineraries = async (): Promise<Itinerary[]> => {
    const { data, error } = await supabase
        .from('itineraries')
        .select(`
            *,
            profiles (name),
            itinerary_pois (poi_id, order)
        `);
    if (error) throw error;
    return transformItineraryData(data || []);
};

export const fetchCharacters = async (): Promise<Character[]> => {
    const { data, error } = await supabase.from('characters').select('*');
    if (error) throw error;
    return data || [];
};

export const fetchCategories = async (): Promise<Category[]> => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    return data || [];
};

export const fetchPeriods = async (): Promise<Period[]> => {
    const { data, error } = await supabase.from('periods').select('*');
    if (error) throw error;
    return data || [];
};

export const fetchUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        avatarUrl: p.avatar_url,
        contributions: p.contributions
    }));
};

// Write Functions
export const addPoi = async (poiData: Omit<Poi, 'id' | 'creationDate' | 'author'>) => {
    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // 2. Prepare POI data for insertion
    const poiToInsert = {
        author_id: user.id,
        title: poiData.title,
        description: poiData.description,
        location: poiData.location,
        event_date: poiData.eventDate,
        period_id: poiData.periodId,
        type: poiData.type,
        photos: poiData.photos,
        tags: poiData.tags,
        coordinates: poiData.type === 'point' ? (poiData as any).coordinates : null,
        path_coordinates: poiData.type === 'path' ? (poiData as any).pathCoordinates : null,
        bounds: poiData.type === 'area' ? (poiData as any).bounds : null,
    };

    // 3. Insert POI and get the new ID
    const { data: newPoi, error: poiError } = await supabase
        .from('pois')
        .insert(poiToInsert)
        .select('id')
        .single();
    
    if (poiError) throw poiError;
    if (!newPoi) throw new Error("Failed to create POI");
    
    const newPoiId = newPoi.id;

    // 4. Insert into join tables
    if (poiData.categoryIds && poiData.categoryIds.length > 0) {
        const categoriesToInsert = poiData.categoryIds.map(catId => ({
            poi_id: newPoiId,
            category_id: catId
        }));
        const { error: catError } = await supabase.from('poi_categories').insert(categoriesToInsert);
        if (catError) throw catError;
    }
    
    if (poiData.linkedCharacterIds && poiData.linkedCharacterIds.length > 0) {
        const charactersToInsert = poiData.linkedCharacterIds.map(charId => ({
            poi_id: newPoiId,
            character_id: charId
        }));
        const { error: charError } = await supabase.from('poi_characters').insert(charactersToInsert);
        if (charError) throw charError;
    }
    
    return newPoi;
};

export const addCharacter = async (charData: Omit<Character, 'id'>) => {
    const { data, error } = await supabase.from('characters').insert(charData).select().single();
    if (error) throw error;
    return data;
};

export const addItinerary = async (itineraryData: Omit<Itinerary, 'id' | 'author'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const itineraryToInsert = {
        author_id: user.id,
        title: itineraryData.title,
        description: itineraryData.description,
        estimated_duration: itineraryData.estimatedDuration,
        tags: itineraryData.tags,
        cover_photo: itineraryData.coverPhoto,
    };
    
    const { data: newItinerary, error: itError } = await supabase
        .from('itineraries')
        .insert(itineraryToInsert)
        .select('id')
        .single();

    if (itError) throw itError;
    if (!newItinerary) throw new Error("Failed to create itinerary");

    if (itineraryData.poiIds && itineraryData.poiIds.length > 0) {
        const poisToInsert = itineraryData.poiIds.map((poiId, index) => ({
            itinerary_id: newItinerary.id,
            poi_id: poiId,
            order: index,
        }));
        const { error: itPoisError } = await supabase.from('itinerary_pois').insert(poisToInsert);
        if (itPoisError) throw itPoisError;
    }
    
    return newItinerary;
};