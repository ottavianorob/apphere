export interface Coordinates {
  latitude: number;
  longitude: number;
  heading?: number | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface Period {
  id: string;
  name: string;
  start_year: number;
  end_year: number;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  wikipediaUrl: string;
  photos: Photo[];
}

export interface Photo {
  id:string;
  url: string;
  caption: string;
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  contributions: number;
}

export interface Poi {
  id: string;
  creationDate: string;
  author: string;
  coordinates: Coordinates;
  periodId: string;
  categoryIds: string[];
  title: string;
  location: string;
  eventDate: string;
  description: string;
  photos: Photo[];
  linkedCharacterIds: string[];
  tags?: string[];
  favoriteCount: number;
  isFavorited: boolean;
  // FIX: Add optional properties for different POI types.
  type?: 'point' | 'path' | 'area';
  pathCoordinates?: Coordinates[];
  bounds?: Coordinates[];
}

export interface Itinerary {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  poiIds: string[];
  author: string;
  tags?: string[];
  coverPhoto: Photo;
  favoriteCount: number;
  isFavorited: boolean;
}
