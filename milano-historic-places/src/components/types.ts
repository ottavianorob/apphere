// src/components/types.ts
export type Place = {
  id: string;
  title: string;
  geometry: { type: 'Point'; coordinates: [number, number] };
  image: string;
  teaser: string;
};

export type Itinerary = {
  id: string;
  title: string;
  stops: string[];
};