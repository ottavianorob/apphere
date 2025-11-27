
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface Period {
  id: string;
  name: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  wikipediaUrl: string;
}

export interface Photo {
  id: string;
  url: string;
  caption: string;
}

export interface Point {
  id: string;
  creationDate: string;
  author: string;
  coordinates: Coordinates;
  periodId: string;
  categoryId: string;
  title: string;
  description: string;
  photos: Photo[];
  linkedCharacterIds: string[];
}

export interface Itinerary {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  pointIds: string[];
}
