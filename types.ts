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

export interface Point {
  type: 'point';
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
}

export interface Path {
  type: 'path';
  id: string;
  creationDate: string;
  author: string;
  pathCoordinates: Coordinates[];
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
}

export interface Area {
  type: 'area';
  id: string;
  title: string;
  description: string;
  bounds: Coordinates[];
  location: string;
  eventDate: string;
  creationDate: string;
  author: string;
  periodId: string;
  categoryIds: string[];
  photos: Photo[];
  linkedCharacterIds: string[];
  tags?: string[];
  favoriteCount: number;
  isFavorited: boolean;
}

export type Poi = Point | Path | Area;

export interface Itinerary {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  poiIds: string[];
  author: string;
  tags?: string[];
  coverPhoto: Photo;
}