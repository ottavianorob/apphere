export type Place = {
  id: string;
  title: string;
  category: string; // una delle 5 macro-categorie
  tags?: string[]; // tag secondari facoltativi
  teaser?: string;
  // image field removed: images referenced via photoIds and photos.json
  geometry: { type: 'Point'; coordinates: [number, number] };
  photoIds?: string[];
  characterIds?: string[];
  date?: string;
};

export type Photo = {
  id: string;
  url: string;       // e.g. "/img/photos/photo.jpg"
  caption?: string;
  date?: string;
  credit?: string;
  location?: string;
};

export type Character = {
  id: string;
  name: string;
  bio?: string;
  image?: string;    // e.g. "/img/characters/char.jpg"
  birth?: string;
  death?: string;
  links?: { label: string; url: string }[];
};

export type Itinerary = {
  id: string;
  title: string;
  image?: string;    // e.g. "/img/paths/path.jpg"
  stops: string[];
};