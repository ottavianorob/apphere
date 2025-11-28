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
      setState({
        loading: false,
        error: null,
        data: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          heading: position.coords.heading,
        },
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
    
    return () => {
        if (watcherId) {
            navigator.geolocation.clearWatch(watcherId);
        }
    };

  }, []);

  return state;
};

export default useGeolocation;