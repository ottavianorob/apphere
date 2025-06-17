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

    // Stile “clean & modern” Positron da CARTO
    const map = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [9.19, 45.464], // Milano
      zoom: 12,
      attributionControl: true,
    });

    // On map load: add markers
    map.on('load', () => {
      console.log('✅ Map loaded successfully with Positron style');

      fetch(import.meta.env.BASE_URL + 'places.json')
        .then(res => res.json())
        .then((places: Place[]) => {
          places.forEach(place => {
            const [lon, lat] = place.geometry.coordinates;
            const el = document.createElement('div');
            el.className =
              'bg-blue-600 w-4 h-4 rounded-full border-2 border-white cursor-pointer shadow';

            el.addEventListener('click', () => onSelect(place));

            new maplibregl.Marker(el)
              .setLngLat([lon, lat])
              .addTo(map);
          });
        })
        .catch(err => console.error('Error loading places.json:', err));
    });

    // Fallback to inline OSM raster style on any error
    map.on('error', (e) => {
      console.warn('⚠️ Map error, switching to OSM raster fallback style', e);
      map.setStyle({
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256
          }
        },
        layers: [
          { id: 'osm-layer', type: 'raster', source: 'osm' }
        ]
      });
    });

    return () => {
      map.remove();
    };
  }, [onSelect]);

  return <div ref={mapRef} className="h-screen w-full" />;
}