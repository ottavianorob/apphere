import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Place } from './types';

// dentro MapView.tsx, invece di aggiungere direttamente i marker:
import Supercluster from 'supercluster';

useEffect(() => {
  // ...dopo aver scaricato 'places'
  const index = new Supercluster({ radius: 50, maxZoom: 16 });
  index.load(places.map(p => ({
    type: 'Feature',
    geometry: p.geometry,
    properties: { id: p.id }
  })));
  map.on('move', () => {
    const zoom = map.getZoom();
    const bounds = map.getBounds().toArray().flat();
    const clusters = index.getClusters(bounds, Math.round(zoom));
    // rimuovi vecchi layer/markers e poi:
    clusters.forEach(cluster => {
      // se cluster.properties.cluster: disegna un cerchio con count
      // altrimenti disegna un marker singolo
    });
  });
}, [onSelect]);

type Props = {
  onSelect: (place: Place) => void;
};

export default function MapView({ onSelect }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Mappa con stile Positron (pulito e moderno) da CARTO
    const map = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [9.19, 45.464], // Milano
      zoom: 12,
      attributionControl: true,
    });

    // Carica i punti d'interesse e aggiunge i marker
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

    return () => {
      map.remove();
    };
  }, [onSelect]);

  return <div ref={mapRef} className="h-screen w-full" />;
}