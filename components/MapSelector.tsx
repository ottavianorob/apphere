import React, { useState, useEffect, useRef, forwardRef, useCallback } from 'react';
import ReactMapGL, { Marker, Source, Layer, MapRef } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import { Coordinates } from '../types';

(maplibregl as any).workerURL = "https://aistudiocdn.com/maplibre-gl@^4.3.2/dist/maplibre-gl-csp-worker.js";

interface MapSelectorProps {
  type: 'point' | 'path' | 'area';
  coordinates: Coordinates[];
  setCoordinates: React.Dispatch<React.SetStateAction<Coordinates[]>>;
  userLocation: Coordinates | null;
  initialViewState?: { longitude: number; latitude: number; zoom: number };
}

const MapSelector = forwardRef<MapRef, MapSelectorProps>(({ type, coordinates, setCoordinates, userLocation, initialViewState }, ref) => {
    const MAPTILER_KEY = 'IIPnH80T6eAsOrGsVBLp';
    const mapContainerRef = useRef<HTMLDivElement>(null);

    const [viewState, setViewState] = useState(
        initialViewState || {
            longitude: userLocation?.longitude || 9.189982,
            latitude: userLocation?.latitude || 45.464204,
            zoom: userLocation ? 15 : 12,
        }
    );
    
    useEffect(() => {
        const container = mapContainerRef.current;
        if (!container) return;
        const resizeObserver = new ResizeObserver(() => {
            if ((ref as React.RefObject<MapRef>).current) {
                (ref as React.RefObject<MapRef>).current?.getMap().resize();
            }
        });
        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, [ref]);

    useEffect(() => {
        if (userLocation && (ref as React.RefObject<MapRef>).current && !initialViewState) {
            (ref as React.RefObject<MapRef>).current?.flyTo({
                center: [userLocation.longitude, userLocation.latitude],
                zoom: 15,
                duration: 1500,
            });
        }
    }, [userLocation, ref, initialViewState]);

    const handleClick = useCallback((event: maplibregl.MapLayerMouseEvent) => {
        const { lng, lat } = event.lngLat;
        const newCoord = { latitude: lat, longitude: lng };

        if (type === 'point') {
            setCoordinates([newCoord]);
        } else {
            setCoordinates(prev => [...prev, newCoord]);
        }
    }, [type, setCoordinates]);

    const pathGeoJSON: any = { type: 'Feature', geometry: { type: 'LineString', coordinates: coordinates.map(c => [c.longitude, c.latitude]) } };
    const areaGeoJSON: any = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coordinates.map(c => [c.longitude, c.latitude])] } };

    return (
        <div ref={mapContainerRef} className="h-64 w-full rounded-lg overflow-hidden relative border border-gray-300/80">
            <ReactMapGL
                mapLib={maplibregl}
                ref={ref}
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
                mapStyle={`https://api.maptiler.com/maps/0197890d-f9ac-7f85-b738-4eecc9189544/style.json?key=${MAPTILER_KEY}`}
                onClick={handleClick}
                cursor="crosshair"
            >
                {coordinates.map((coord, index) => (
                    <Marker key={index} longitude={coord.longitude} latitude={coord.latitude} anchor="center">
                        <div className="w-3 h-3 bg-red-600 rounded-full border-2 border-white" />
                    </Marker>
                ))}
                {type === 'path' && coordinates.length > 1 && (
                    <Source id="path-preview" type="geojson" data={pathGeoJSON}>
                        <Layer id="path-preview-layer" type="line" paint={{ 'line-color': '#B1352E', 'line-width': 3, 'line-dasharray': [2, 2] }} />
                    </Source>
                )}
                {type === 'area' && coordinates.length > 2 && (
                    <Source id="area-preview" type="geojson" data={areaGeoJSON}>
                        <Layer id="area-preview-layer" type="fill" paint={{ 'fill-color': '#134A79', 'fill-opacity': 0.3, 'fill-outline-color': '#134A79' }} />
                    </Source>
                )}
            </ReactMapGL>
        </div>
    );
});

export default MapSelector;