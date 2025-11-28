import { useState, useEffect } from 'react';
import { Coordinates } from '../types';

interface GeolocationState {
  loading: boolean;
  error: GeolocationPositionError | null;
  data: Coordinates | null;
}

const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    let watcherId: number;

    const onSuccess = (position: GeolocationPosition) => {
       setState(prevState => {
        // Controlla se abbiamo già un heading più preciso da deviceorientation
        const hasDeviceOrientationHeading = prevState.data?.heading !== undefined && prevState.data.heading !== null;
        
        return {
          ...prevState,
          loading: false,
          error: null,
          data: {
            ...prevState.data,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            // Usa l'heading dalla geolocalizzazione solo come fallback
            heading: hasDeviceOrientationHeading ? prevState.data.heading : position.coords.heading,
          } as Coordinates,
        };
      });
    };

    const onError = (error: GeolocationPositionError) => {
      setState(prevState => ({
        ...prevState,
        loading: false,
        error,
      }));
    };

    if (!navigator.geolocation) {
      setState({
        loading: false,
        error: {
            code: 0,
            message: 'Geolocation is not supported by your browser.',
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3,
        },
        data: null,
      });
      return;
    }

    watcherId = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
    });

    // --- Integrazione Device Orientation ---
    const handleOrientation = (event: DeviceOrientationEvent) => {
      // `webkitCompassHeading` è per iOS Safari. `alpha` è lo standard.
      const heading = (event as any).webkitCompassHeading ?? event.alpha;
      if (heading !== null && heading !== undefined) {
        setState(prevState => {
          // Aggiungi l'heading solo se abbiamo già i dati di posizione
          if (prevState.data) {
            return {
              ...prevState,
              data: {
                ...prevState.data,
                heading: heading,
              }
            };
          }
          return prevState; // Non fare nulla se non abbiamo ancora le coordinate
        });
      }
    };
    
    if (window.DeviceOrientationEvent) {
      // Nota: Su iOS 13+ è richiesta l'interazione dell'utente per il permesso.
      // Questa implementazione funzionerà su Android e altri dispositivi,
      // ma potrebbe non funzionare su iOS senza un permesso preventivo.
      // È comunque un miglioramento significativo rispetto all'inaffidabile `coords.heading`.
      window.addEventListener('deviceorientation', handleOrientation);
    }
    
    return () => {
        if (watcherId) {
            navigator.geolocation.clearWatch(watcherId);
        }
        if (window.DeviceOrientationEvent) {
          window.removeEventListener('deviceorientation', handleOrientation);
        }
    };

  }, []);

  return state;
};

export default useGeolocation;