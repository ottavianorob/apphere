// src/components/MapView.tsx
import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Supercluster from 'supercluster';
import type { ClusterFeature, PointFeature } from 'supercluster';
import type { Place } from './types';
import placesData from '../types/places.json';
import CategoryIcon from './CategoryIcon';

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
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const allPlacesRef = useRef<Place[]>([]);
  const indexRef = useRef<Supercluster | null>(null);
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

    clusters.forEach((cluster: ClusterFeature<any> | PointFeature<any>) => {
      const [lon, lat] = (cluster.geometry.coordinates as [number, number]);
      const el = document.createElement('div');
      el.classList.add('map-marker-element');

      if ((cluster.properties as any).cluster) {
        const count = (cluster.properties as any).point_count;
        el.className = 'flex items-center justify-center bg-accent-bordeaux text-white rounded-full border border-accent-gold shadow-sm transition-all duration-200';
        // Size based on count, bounded to avoid extremes
        const size = 24 + Math.min(count, 20) * 2;
        el.style.width = el.style.height = `${size}px`;
        el.textContent = String(count);
        el.style.cursor = 'pointer';
        el.style.fontSize = '13px';
        el.style.fontWeight = 'bold';
        el.style.boxShadow = '0 1px 4px rgba(80,40,20,0.12)';
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', `Cluster di ${count} luoghi, clicca per zoommare`);
        el.addEventListener('mouseenter', () => {
          el.style.boxShadow = '0 4px 16px rgba(80,40,20,0.22)';
        });
        el.addEventListener('mouseleave', () => {
          el.style.boxShadow = '0 1px 4px rgba(80,40,20,0.12)';
        });
        el.addEventListener('click', () => {
          const clusterId = (cluster.properties as any).cluster_id;
          // getClusterExpansionZoom ora restituisce una Promise
          const expZoom = indexRef.current!.getClusterExpansionZoom(clusterId);
          map.easeTo({ center: [lon, lat], zoom: expZoom + 1.5, duration: 600, essential: true });
          setTimeout(() => {
            updateMarkers();
          }, 700);
        });
        el.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            el.click();
          }
        });
      } else {
        el.className = 'bg-accent-gold w-10 h-10 rounded-full border border-accent-bordeaux cursor-pointer shadow transition-all duration-200';
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', `Luogo: ${(cluster.properties as any).title}`);
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
        el.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            el.click();
          }
        });
      }
      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([lon, lat]).addTo(map);
      markersRef.current.push(marker);
    });
  }, [onSelect]);

  useEffect(() => {
    if (!mapRef.current) return;
    // Scegli stile mappa in base a dark mode
    const isDark = document.body.classList.contains('dark');
    const styleUrl = isDark
      ? 'https://api.maptiler.com/maps/01978930-5897-70b1-8db4-af3d9bc8d76a/style.json?key=gH3DLPa6Gtu1j6wgHTNx'
      : 'https://api.maptiler.com/maps/0197890d-f9ac-7f85-b738-4eecc9189544/style.json?key=gH3DLPa6Gtu1j6wgHTNx';
    const map = new maplibregl.Map({
      container: mapRef.current,
      style: styleUrl,
      center: [9.19, 45.464],
      zoom: 12,
      attributionControl: false,
    });
    mapInstanceRef.current = map;
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => {
      // Use imported JSON data
      const places: Place[] = placesData as Place[];
      console.log('Loaded places from types:', places.length, places);
      allPlacesRef.current = places;
      buildIndex(places);
      updateMarkers();
      map.on('moveend', updateMarkers);
      map.on('zoomend', updateMarkers);
    });

    return () => { map.remove(); };
  }, [updateMarkers]);

  // Aggiorna stile mappa se cambia dark mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const observer = new MutationObserver(() => {
      const isDark = document.body.classList.contains('dark');
      const styleUrl = isDark
        ? 'https://api.maptiler.com/maps/01978930-5897-70b1-8db4-af3d9bc8d76a/style.json?key=gH3DLPa6Gtu1j6wgHTNx'
        : 'https://api.maptiler.com/maps/0197890d-f9ac-7f85-b738-4eecc9189544/style.json?key=gH3DLPa6Gtu1j6wgHTNx';
      if (map.getStyle().sprite && !map.getStyle().sprite?.includes(isDark ? '8db4' : 'b738')) {
        map.setStyle(styleUrl);
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

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
    <div className="relative h-screen w-full bg-newspaper-bg dark:bg-gradient-to-br dark:from-[#18151a] dark:to-[#23202a]">
      {/* Filtri: mobile barra orizzontale, desktop card verticale in alto a sinistra, senza bordi, solo ombra e padding */}
      <div className="absolute z-20 top-4 left-1/2 -translate-x-1/2 w-[95vw] max-w-xl flex gap-2 overflow-x-auto p-2 rounded shadow-lg bg-white/95 dark:bg-[#18151a]/95 md:static md:top-auto md:left-auto md:translate-x-0 md:w-auto md:max-w-none md:flex-col md:items-start md:gap-2 md:p-6 md:rounded-2xl md:shadow-2xl md:bg-white/95 md:dark:bg-[#18151a]/95 md:absolute md:left-16 md:top-12 md:right-auto md:ml-4 md:mr-4">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-lg text-base whitespace-nowrap transition flex items-center space-x-2 font-heading tracking-wide shadow-sm
              ${filterCategory === cat ? 'bg-accent-bordeaux dark:bg-accent-gold text-white dark:text-accent-bordeaux' : 'bg-neutral-light dark:bg-[#23202a] text-text-primary dark:text-accent-gold hover:bg-accent-gold dark:hover:bg-accent-bordeaux'}`}
            style={{ minWidth: 110, border: 'none' }}
          >
            <CategoryIcon
              category={cat}
              className={`${filterCategory === cat ? 'text-white dark:text-accent-bordeaux' : 'text-accent-bordeaux dark:text-accent-gold font-heading'}`}
            />
            <span>{cat}</span>
          </button>
        ))}
      </div>
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}