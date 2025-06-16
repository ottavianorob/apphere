import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

type Place = {
  id: string;
  title: string;
  geometry: { type: 'Point'; coordinates: [number, number] };
};

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // 1. Inizializza la mappa
    const map = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [9.19, 45.464],   // Milano
      zoom: 12,
    });

    // 2. Carica i dati JSON
    fetch('/places.json')
      .then(r => r.json())
      .then((places: Place[]) => {
        places.forEach(place => {
          const [lon, lat] = place.geometry.coordinates;

          // crea un elemento HTML per il marker
          const el = document.createElement('div');
          el.className = 'bg-blue-600 w-3 h-3 rounded-full';

          new maplibregl.Marker(el)
            .setLngLat([lon, lat])
            .setPopup(new maplibregl.Popup({ offset: 15 }).setText(place.title))
            .addTo(map);
        });
      });

    // pulizia
    return () => map.remove();
  }, []);

  return <div ref={mapRef} className="h-screen w-full" />;
}