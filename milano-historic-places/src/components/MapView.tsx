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

    // Mappa con layer OSM raster inline (full-control, reliable)
    const map = new maplibregl.Map({
      container: mapRef.current,
      style: {
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
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm'
          }
        ]
      },
      center: [9.19, 45.464], // Milano
      zoom: 12
    });

    map.on('load', () => {
      // Carica i POI e li raggruppa in cluster
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
                image: p.image
              }
            }))
          };

          map.addSource('places', {
            type: 'geojson',
            data: geojson,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
          });

          // Cerchi dei cluster
          map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'places',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': '#51bbd6',
              'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40]
            }
          });

          // Numero di elementi nel cluster
          map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'places',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['Arial Unicode MS Bold'],
              'text-size': 12
            }
          });

          // Punti singoli
          map.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'places',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': '#f28cb1',
              'circle-radius': 8,
              'circle-stroke-width': 1,
              'circle-stroke-color': '#fff'
            }
          });

          // Click sui cluster → zoom in
          map.on('click', 'clusters', (e) => {
            const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
            const clusterId = (features[0].properties as any).cluster_id;
            (map.getSource('places') as any).getClusterExpansionZoom(
              clusterId,
              (err: any, zoom: number) => {
                if (err) return;
                map.easeTo({
                  center: (features[0].geometry as any).coordinates,
                  zoom
                });
              }
            );
          });

          // Click sui punti singoli → apri BottomSheet
          map.on('click', 'unclustered-point', (e) => {
            const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] });
            const props = features[0].properties as any;
            const coords = (features[0].geometry as any).coordinates as [number, number];
            const place: Place = {
              id: props.id,
              title: props.title,
              teaser: props.teaser,
              image: props.image,
              geometry: { type: 'Point', coordinates: coords }
            };
            onSelect(place);
          });

          // Cambio cursore hover
          ['clusters', 'unclustered-point'].forEach(layer => {
            map.on('mouseenter', layer, () => map.getCanvas().style.cursor = 'pointer');
            map.on('mouseleave', layer, () => map.getCanvas().style.cursor = '');
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