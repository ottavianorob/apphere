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

    // Inizializza la mappa (stile Positron)
    const map = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [9.19, 45.464],
      zoom: 12,
    });

    // Carica i dati e configura clustering
    fetch(import.meta.env.BASE_URL + 'places.json')
      .then(res => res.json())
      .then((places: Place[]) => {
        // Trasforma in GeoJSON FeatureCollection
        const geojson = {
          type: 'FeatureCollection' as const,
          features: places.map(p => ({
            type: 'Feature' as const,
            geometry: p.geometry,
            properties: { id: p.id, title: p.title, teaser: p.teaser, image: p.image },
          })),
        };

        map.on('load', () => {
          // Aggiungi fonte con clustering
          map.addSource('places', {
            type: 'geojson',
            data: geojson,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50,
          });

          // Cerchi dei cluster
          map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'places',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': '#51bbd6',
              'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40],
            },
          });

          // Numero nei cluster
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
          });

          // Punti singoli non clusterizzati
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

          // Click sui cluster → zoom in
          map.on('click', 'clusters', e => {
            const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
            const clusterId = features[0].properties!.cluster_id;
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

          // Click sui punti singoli → onSelect
          map.on('click', 'unclustered-point', e => {
            const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] });
            const props = features[0].properties!;
            const place: Place = { 
              id: props.id, 
              title: props.title, 
              teaser: props.teaser, 
              image: props.image, 
              geometry: { type: 'Point', coordinates: (features[0].geometry as any).coordinates } 
            };
            onSelect(place);
          });

          // Cambia il cursore in hover sopra i layer
          map.on('mouseenter', 'clusters', () => map.getCanvas().style.cursor = 'pointer');
          map.on('mouseleave', 'clusters', () => map.getCanvas().style.cursor = '');
          map.on('mouseenter', 'unclustered-point', () => map.getCanvas().style.cursor = 'pointer');
          map.on('mouseleave', 'unclustered-point', () => map.getCanvas().style.cursor = '');
        });
      })
      .catch(err => console.error('Error loading places.json:', err));

    return () => {
      map.remove();
    };
  }, [onSelect]);

  return <div ref={mapRef} className="h-screen w-full" />;
}