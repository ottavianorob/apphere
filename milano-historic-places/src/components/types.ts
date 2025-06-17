export type Place = {
  id: string;
  title: string;
  teaser: string;
  image: string;
  geometry: { type: 'Point'; coordinates: [number, number] };
};

export type Itinerary = {
  id: string;
  title: string;
  stops: string[];
};