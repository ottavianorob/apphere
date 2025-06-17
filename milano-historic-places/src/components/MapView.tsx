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

    // Stile Positron (pulito e moderno)
    const map = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [9.19, 45.464], // Milano
      zoom: 12,
      attributionControl: true,
    });

    map.on('load', () => {
      console.log('✅ Positron style loaded, ora aggiungo i POI');

      fetch(import.meta.env.BASE_URL + 'places.json')
        .then(res => res.json())
        .then((places: Place[]) => {
          const geojson = {
            type: 'FeatureCollection' as const,
            features: places.map(p => ({
              type: 'Feature' as const,
              geometry: p.geometry,
              properties: {
                id: p.id,
                title: p.title,
                teaser: p.teaser,
                image: p.image,
              },
            })),
          };

          // Aggiungo la fonte con clustering
          map.addSource('places', {
            type: 'geojson',
            data: geojson,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50,
          });

          // Layer dei cluster (cerchi)
          map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'places',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': '#51bbd6',
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                10,
                30,
                30,
                40,
              ],
            },
          });

          // Layer del conteggio nei cluster
          map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'places',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['Arial Unicode MS Bold'],
              'text-size': 12,
            },
            paint: {
              'text-color': '#ffffff',
            },
          });

          // Layer dei punti singoli
          map.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'places',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': '#f28cb1',
              'circle-radius': 8,
              'circle-stroke-width': 1,
              'circle-stroke-color': '#fff',
            },
          });

          // Click su cluster → zoom in
          map.on('click', 'clusters', e => {
            const features = map.queryRenderedFeatures(e.point, {
              layers: ['clusters'],
            });
            const clusterId = (features[0].properties as any).cluster_id;
            (map.getSource('places') as any).getClusterExpansionZoom(
              clusterId,
              (err: any, zoom: number) => {
                if (err) return;
                map.easeTo({
                  center: (features[0].geometry as any).coordinates,
                  zoom,
                });
              }
            );
          });

          // Click su punto singolo → onSelect
          map.on('click', 'unclustered-point', e => {
            const features = map.queryRenderedFeatures(e.point, {
              layers: ['unclustered-point'],
            });
            const props = features[0].properties as any;
            const coords = (features[0].geometry as any)
              .coordinates as [number, number];
            const place: Place = {
              id: props.id,
              title: props.title,
              teaser: props.teaser,
              image: props.image,
              geometry: { type: 'Point', coordinates: coords },
            };
            onSelect(place);
          });

          // Cambia cursore su hover
          ['clusters', 'unclustered-point'].forEach(layer => {
            map.on('mouseenter', layer, () =>
              (map.getCanvas().style.cursor = 'pointer')
            );
            map.on('mouseleave', layer, () =>
              (map.getCanvas().style.cursor = '')
            );
          });
        })
        .catch(err => console.error('Errore caricamento places.json:', err));
    });

    return () => {
      map.remove();
    };
  }, [onSelect]);

  return <div ref={mapRef} className="h-screen w-full" />;
}