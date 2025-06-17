// src/components/MapView.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Supercluster from 'supercluster';
import type { Place } from '../types';

type Props = { onSelect: (place: Place) => void; selectedPlace?: Place };

export default function MapView({ onSelect, selectedPlace }: Props) {
  const categories = [
    'All',
    'Storia & Patrimonio',
    'Arte & Cultura',
    'Cronaca & Società',
    'Cinema & TV',
    'Musica & Spettacolo',
  ];
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map>();
  const allPlacesRef = useRef<Place[]>([]);
  const indexRef = useRef<Supercluster>();
  const filteredRef = useRef<Place[]>([]);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const buildIndex = (places: Place[]) => {
    filteredRef.current = places;
    const idx = new Supercluster({ radius: 50, maxZoom: 20 });
    const features = places.map(p => ({
      type: 'Feature' as const,
      geometry: p.geometry,
      properties: {
        id: p.id,
        title: p.title,
        teaser: p.teaser,
        category: p.category,
        photoIds: p.photoIds || [],
        characterIds: p.characterIds || [],
        date: p.date || ''
      },
    }));
    idx.load(features);
    indexRef.current = idx;
  };

  const updateMarkers = useCallback(() => {
    const map = mapInstanceRef.current;
    const idx = indexRef.current;
    if (!map || !idx) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const boundsArr = map.getBounds().toArray().flat() as [number, number, number, number];
    const zoom = Math.floor(map.getZoom());
    const clusters = idx.getClusters(boundsArr, zoom);

    clusters.forEach(cluster => {
      const [lon, lat] = (cluster.geometry.coordinates as [number, number]);
      const el = document.createElement('div');
      el.classList.add('map-marker-element');

      if ((cluster.properties as any).cluster) {
        const count = (cluster.properties as any).point_count;
        el.className = 'flex items-center justify-center bg-blue-600 text-white rounded-full';
        // Size based on count, bounded to avoid extremes
        const size = 20 + Math.min(count, 20) * 2;
        el.style.width = el.style.height = `${size}px`;
        el.textContent = String(count);
        el.style.cursor = 'pointer';
        el.style.fontSize = '12px';
        el.style.fontWeight = 'bold';
        el.style.boxShadow = '0 0 2px rgba(0,0,0,0.5)';
        el.addEventListener('click', () => {
          const clusterId = (cluster.properties as any).cluster_id;
          indexRef.current!.getClusterExpansionZoom(clusterId, (_err, expZoom) => {
            map.easeTo({ center: [lon, lat], zoom: expZoom + 1 });
          });
        });
      } else {
        el.className = 'bg-pink-400 w-10 h-10 rounded-full border-2 border-white cursor-pointer shadow-lg';
        el.addEventListener('click', () => {
          const props = cluster.properties as any;
          const place: Place = {
            id: props.id,
            title: props.title,
            teaser: props.teaser,
            category: props.category,
            photoIds: props.photoIds,
            characterIds: props.characterIds,
            date: props.date,
            geometry: { type: 'Point', coordinates: [lon, lat] },
          };
          onSelect(place);
        });
      }

      const marker = new maplibregl.Marker(el).setLngLat([lon, lat]).addTo(map);
      markersRef.current.push(marker);
    });
  }, [onSelect]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [9.19, 45.464],
      zoom: 12,
      attributionControl: false,
    });
    mapInstanceRef.current = map;
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => {
      fetch('/places.json')
        .then(res => {
          if (!res.ok) throw new Error('Fetch places.json failed: ' + res.status);
          return res.json();
        })
        .then((places: Place[]) => {
          console.log('Loaded places:', places.length, places);
          allPlacesRef.current = places;
          buildIndex(places);
          updateMarkers();
          map.on('moveend', updateMarkers);
          map.on('zoomend', updateMarkers);
        })
        .catch(err => console.error('Error loading places.json:', err));
    });

    return () => { map.remove(); };
  }, [updateMarkers]);

  useEffect(() => {
    const filtered =
      filterCategory === 'All'
        ? allPlacesRef.current
        : allPlacesRef.current.filter(p => p.category === filterCategory);
    buildIndex(filtered);
    updateMarkers();
  }, [filterCategory, updateMarkers]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && selectedPlace && selectedPlace.geometry?.coordinates) {
      const [lon, lat] = selectedPlace.geometry.coordinates;
      map.easeTo({ center: [lon, lat], zoom: Math.max(map.getZoom(), 14) });
    }
  }, [selectedPlace]);

  return (
    <div className="relative h-screen w-full">
      <div className="absolute top-4 inset-x-4 bg-white/90 p-2 rounded-full shadow z-20 flex space-x-2 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition ${
              filterCategory === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}