export type Place = {
  id: string;
  title: string;
  geometry: { type: 'Point'; coordinates: [number, number] };
  image: string;
  teaser: string;
};