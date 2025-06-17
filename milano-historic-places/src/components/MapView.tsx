import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Place } from './types'; // percorso corretto al tuo tipo

type Props = {
  onSelect: (place: Place) => void;
};

export default function MapView({ onSelect }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${
        import.meta.env.VITE_MAPTILER_KEY
      }`,
      center: [9.19, 45.464],
      zoom: 12
    });

    fetch(import.meta.env.BASE_URL + 'places.json')
      .then(r => r.json())
      .then((places: Place[]) => {
        places.forEach(place => {
          const [lon, lat] = place.geometry.coordinates;

          const el = document.createElement('div');
          el.className = 'bg-blue-600 w-3 h-3 rounded-full cursor-pointer';

          const marker = new maplibregl.Marker(el)
            .setLngLat([lon, lat])
            .addTo(map);

          el.addEventListener('click', () => onSelect(place));
          marker.getElement().addEventListener('click', () => onSelect(place));
        });
      });

    return () => map.remove();
  }, [onSelect]);

  return <div ref={mapRef} className="h-screen w-full" />;
}