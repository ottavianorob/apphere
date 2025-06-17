// src/components/MapView.tsx
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Supercluster from 'supercluster';
import type { Place } from './types';

type Props = {
  onSelect: (place: Place) => void;
};

export default function MapView({ onSelect }: Props) {
  // category filter state
  const categories = [
    'All',
    'Storia & Patrimonio',
    'Arte & Cultura',
    'Cronaca & Società',
    'Cinema & TV',
    'Musica & Spettacolo'
  ];
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // 1. Inizializza la mappa con stile Positron
    const map = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [9.19, 45.464],
      zoom: 12,
      // disabilito l’attribuzione di default
      attributionControl: false,
    });

    // ri-aggiungo l’attribuzione in basso a sinistra in modalità compatta
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-left'
    );

    // 2. Aggiungi controllo geolocalizzazione (posizione utente)
    const geolocateControl = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showAccuracyCircle: true,
      showUserLocation: true,
    });
    map.addControl(geolocateControl, 'top-right');

    map.on('load', () => {
      console.log('✅ Positron style loaded, aggiungo POI e clustering');

      // Auto-trigger della geolocalizzazione
      geolocateControl.trigger();

      // 3. Carica i luoghi dal JSON
      fetch(import.meta.env.BASE_URL + 'places.json')
        .then(res => res.json())
        .then((places: Place[]) => {
          console.log(`🏷️  Loaded ${places.length} places`);

          // filter by category
          const filteredPlaces = filterCategory === 'All'
            ? places
            : places.filter(p => p.category === filterCategory);

          // Prepara dati per supercluster
          const index = new Supercluster({ radius: 50, maxZoom: 20 });
          const features = filteredPlaces.map(p => ({
            type: 'Feature' as const,
            geometry: p.geometry,
            properties: {
              id: p.id,
              title: p.title,
              teaser: p.teaser,
              image: p.image,
            },
          }));
          index.load(features);

          let markers: maplibregl.Marker[] = [];

          const updateMarkers = () => {
            markers.forEach(m => m.remove());
            markers = [];

            const bounds = map.getBounds().toArray().flat() as [number, number, number, number];
            const zoom = Math.floor(map.getZoom());
            const clusters = index.getClusters(bounds, zoom);

            clusters.forEach(cluster => {
              const [lon, lat] = (cluster.geometry.coordinates as [number, number]);
              const el = document.createElement('div');

              if ((cluster.properties as any).cluster) {
                // Cluster
                const count = (cluster.properties as any).point_count;
                el.className = 'flex items-center justify-center bg-blue-600 text-white rounded-full';
                const size = 20 + (count / filteredPlaces.length) * 30;
                el.style.width = el.style.height = `${size}px`;
                el.textContent = String(count);
                el.style.cursor = 'pointer';
                el.style.fontSize = '12px';
                el.style.fontWeight = 'bold';
                el.style.boxShadow = '0 0 2px rgba(0,0,0,0.5)';

                el.addEventListener('click', () => {
                  const clusterId = (cluster.properties as any).cluster_id;
                  index.getClusterExpansionZoom(clusterId, (_err, expansionZoom) => {
                    // Zooma al livello +1 oltre a quello di espansione
                    map.easeTo({ center: [lon, lat], zoom: expansionZoom + 1 });
                  });
                });
              } else {
                // Punto singolo
                el.className = 'bg-pink-400 w-10 h-10 rounded-full border-2 border-white cursor-pointer shadow-lg';
                el.addEventListener('click', () => {
                  const props = cluster.properties as any;
                  const place: Place = {
                    id: props.id,
                    title: props.title,
                    teaser: props.teaser,
                    image: props.image,
                    geometry: { type: 'Point', coordinates: [lon, lat] },
                  };
                  onSelect(place);
                });
              }

              const marker = new maplibregl.Marker(el).setLngLat([lon, lat]).addTo(map);
              markers.push(marker);
            });
          };

          map.on('moveend', updateMarkers);
          updateMarkers();
        })
        .catch(err => console.error('Errore caricamento places.json:', err));
    });

    return () => {
      map.remove();
    };
  }, [onSelect, filterCategory]);

  return (
    <div className="relative h-screen w-full">
      <div className="absolute top-4 left-4 bg-white/90 p-2 rounded shadow z-20">
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="text-sm w-full"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}