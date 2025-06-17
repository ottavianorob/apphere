import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Place } from './types';

type Props = {
  onSelect: (place: Place) => void;
};

export default function MapView({ onSelect }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [9.19, 45.464],
      zoom: 12
    });

    fetch(import.meta.env.BASE_URL + 'places.json')
      .then(res => res.json())
      .then((places: Place[]) => {
        places.forEach(place => {
          const [lon, lat] = place.geometry.coordinates;
          const el = document.createElement('div');
          el.className =
            'bg-blue-600 w-4 h-4 rounded-full border-2 border-white cursor-pointer';
          el.addEventListener('click', () => onSelect(place));
          new maplibregl.Marker(el).setLngLat([lon, lat]).addTo(map);
        });
      })
      .catch(err => console.error(err));

    return () => map.remove();
  }, [onSelect]);

  return <div ref={mapRef} className="h-screen w-full" />;
}