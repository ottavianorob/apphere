// src/components/MapView.tsx
import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Supercluster from 'supercluster';
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
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [9.19, 45.464],
      zoom: 12,
    });

    map.on('load', () => {
      fetch(import.meta.env.BASE_URL + 'places.json')
        .then((res) => res.json())
        .then((places: Place[]) => {
          // Prepara i dati per supercluster
          const index = new Supercluster({
            radius: 50,
            maxZoom: 20,
          });
          const features = places.map((p) => ({
            type: 'Feature' as const,
            geometry: p.geometry,
            properties: { id: p.id, title: p.title, teaser: p.teaser, image: p.image },
          }));
          index.load(features);

          let markers: maplibregl.Marker[] = [];

          function updateMarkers() {
            // Rimuovi marcatori esistenti
            markers.forEach((m) => m.remove());
            markers = [];

            const bounds = map.getBounds().toArray().flat() as [number, number, number, number];
            const zoom = Math.floor(map.getZoom());
            const clusters = index.getClusters(bounds, zoom);

            clusters.forEach((cluster) => {
              const [lon, lat] = (cluster.geometry.coordinates as [number, number]);
              const el = document.createElement('div');

              if ((cluster.properties as any).cluster) {
                // Cluster
                const count = (cluster.properties as any).point_count;
                el.className = 'flex items-center justify-center bg-blue-600 text-white rounded-full';
                const size = 20 + (count / places.length) * 30;
                el.style.width = el.style.height = `${size}px`;
                el.textContent = String(count);
                el.style.cursor = 'pointer';
                el.addEventListener('click', () => {
                  const clusterId = (cluster.properties as any).cluster_id;
                  index.getClusterExpansionZoom(clusterId, (err, expansionZoom) => {
                    if (!err) {
                      map.easeTo({ center: [lon, lat], zoom: expansionZoom });
                    }
                  });
                });
              } else {
                // Punto singolo
                el.className = 'bg-pink-400 w-8 h-8 rounded-full border-2 border-white cursor-pointer';
                el.addEventListener('click', () => {
                  const place: Place = {
                    id: cluster.properties.id,
                    title: cluster.properties.title,
                    teaser: cluster.properties.teaser,
                    image: cluster.properties.image,
                    geometry: { type: 'Point', coordinates: [lon, lat] },
                  };
                  onSelect(place);
                });
              }

              const marker = new maplibregl.Marker(el).setLngLat([lon, lat]).addTo(map);
              markers.push(marker);
            });
          }

          map.on('moveend', updateMarkers);
          updateMarkers();
        });
    });

    return () => {
      map.remove();
    };
  }, [onSelect]);

  return <div ref={mapRef} className="h-screen w-full" />;
}