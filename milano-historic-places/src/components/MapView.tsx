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

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [9.19, 45.464],
      zoom: 12,
    });

    // In caso di errore sul Positron style, fai fallback su OSM raster
    map.on('error', (e) => {
      console.warn('⚠️ Map error, switching to OSM raster fallback', e);
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
            tileSize: 256,
          },
        },
        layers: [
          { id: 'osm-layer', type: 'raster', source: 'osm' },
        ],
      });
    });

    // Solo quando lo style è caricato, fetch e aggiungi i marker
    map.on('load', () => {
      console.log('✅ Map loaded, now fetching POIs');

      fetch('/places.json')
        .then(res => res.json())
        .then((places: Place[]) => {
          // Trasforma in GeoJSON
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

          // Aggiungi la fonte con clustering
          map.addSource('places', {
            type: 'geojson',
            data: geojson,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50,
          });

          // Layer dei cluster
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

          // Etichette dei cluster
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

          // Click sui cluster → zoom
          map.on('click', 'clusters', e => {
            const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
            const clusterId = (features[0].properties as any).cluster_id;
            ;(map.getSource('places') as any).getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
              if (err) return;
              map.easeTo({
                center: (features[0].geometry as any).coordinates,
                zoom,
              });
            });
          });

          // Click sui punti singoli → onSelect
          map.on('click', 'unclustered-point', e => {
            const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] });
            const props = features[0].properties as any;
            const coords = (features[0].geometry as any).coordinates as [number, number];
            const place: Place = {
              id: props.id,
              title: props.title,
              teaser: props.teaser,
              image: props.image,
              geometry: { type: 'Point', coordinates: coords },
            };
            onSelect(place);
          });

          // Cambio cursore
          ['clusters', 'unclustered-point'].forEach(layer => {
            map.on('mouseenter', layer, () => map.getCanvas().style.cursor = 'pointer');
            map.on('mouseleave', layer, () => map.getCanvas().style.cursor = '');
          });
        })
        .catch(err => console.error('Errore caricamento places.json:', err));
    });

    return () => map.remove();
  }, [onSelect]);

  return <div ref={mapRef} className="h-screen w-full" />;
}