
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
    const onSuccess = (position: GeolocationPosition) => {
      setState({
        loading: false,
        error: null,
        data: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      });
    };

    const onError = (error: GeolocationPositionError) => {
      setState({
        loading: false,
        error,
        data: null,
      });
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

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
    
    // We could also watch the position, but for this app, a single check is enough.
    // const watcher = navigator.geolocation.watchPosition(onSuccess, onError);
    // return () => navigator.geolocation.clearWatch(watcher);

  }, []);

  return state;
};

export default useGeolocation;
