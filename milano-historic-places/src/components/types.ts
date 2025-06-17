export type Place = {
  id: string;
  title: string;
  category: string; // una delle 5 macro-categorie
  tags?: string[]; // tag secondari facoltativi
  teaser?: string;
  image?: string;
  geometry: { type: 'Point'; coordinates: [number, number] };
};

export type Itinerary = {
  id: string;
  title: string;
  stops: string[];
};