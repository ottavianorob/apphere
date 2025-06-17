import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Place } from './types';

type Props = { onSelect: (p: Place) => void };

export default function MapView({ onSelect }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`,
      center: [9.19, 45.464],
      zoom: 12
    });

    fetch(import.meta.env.BASE_URL + 'places.json')
      .then(r => r.json())
      .then((places: Place[]) => {
        places.forEach(place => {
          const [lon, lat] = place.geometry.coordinates;

          const marker = new maplibregl.Marker({ color: '#0284c7' })
            .setLngLat([lon, lat])
            .addTo(map);

          // listener sul DOM reale del marker
          marker.getElement().addEventListener('click', () => onSelect(place));
        });
      });

    return () => map.remove();
  }, [onSelect]);

  return <div ref={mapRef} className="h-screen w-full" />;
}