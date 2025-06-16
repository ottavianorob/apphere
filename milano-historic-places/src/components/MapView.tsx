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

    /* 1. Inizializza la mappa ----------------------------------------- */
    const map = new maplibregl.Map({
      container: mapRef.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${
        import.meta.env.VITE_MAPTILER_KEY
      }`,
      center: [9.19, 45.464], // Milano
      zoom: 12
    });

    /* 2. Carica i luoghi dal JSON ------------------------------------- */
    fetch('/places.json')
      .then(r => r.json())
      .then((places: Place[]) => {
        places.forEach(place => {
          const [lon, lat] = place.geometry.coordinates;

          /* 2a. Crea marker */
          const el = document.createElement('div');
          el.className = 'bg-blue-600 w-3 h-3 rounded-full cursor-pointer';

          const marker = new maplibregl.Marker(el)
            .setLngLat([lon, lat])
            .setPopup(
              new maplibregl.Popup({ offset: 15 }).setText(place.title)
            )
            .addTo(map);

          /* 2b. Al click → flyTo + apri popup */
          el.addEventListener('click', () => {
            const flyToOptions: maplibregl.FlyToOptions = {
              // type assertion per evitare l’errore “Expected 1 argument”
              center: [lon, lat] as maplibregl.LngLatLike,
              zoom: 15,
              essential: true
            };
            map.flyTo(flyToOptions);
            marker.togglePopup();
          });
        });
      });

    /* 3. Pulizia all’unmount ----------------------------------------- */
    return () => map.remove();
  }, []);

  return <div ref={mapRef} className="h-screen w-full" />;
}