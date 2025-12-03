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
    let isMounted = true;

    const onSuccess = (position: GeolocationPosition) => {
      if (!isMounted) return;
       setState(prevState => {
        const hasDeviceOrientationHeading = prevState.data?.heading !== undefined && prevState.data.heading !== null;
        
        return {
          ...prevState,
          loading: false,
          error: null,
          data: {
            ...prevState.data,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            heading: hasDeviceOrientationHeading ? prevState.data.heading : position.coords.heading,
          } as Coordinates,
        };
      });
    };
    
    const onFinalError = (error: GeolocationPositionError) => {
        if (!isMounted) return;
        setState(prevState => ({
            ...prevState,
            loading: false,
            error,
        }));
    };

    const onErrorWithFallback = (error: GeolocationPositionError) => {
      if (!isMounted) return;
      // If high accuracy fails, try with low accuracy. This can help on desktop.
      if (error.code === error.POSITION_UNAVAILABLE || error.code === error.TIMEOUT) {
        if (watcherId) navigator.geolocation.clearWatch(watcherId);
        watcherId = navigator.geolocation.watchPosition(onSuccess, onFinalError, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 0,
        });
      } else {
        onFinalError(error);
      }
    };

    if (!navigator.geolocation) {
      if (!isMounted) return;
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

    watcherId = navigator.geolocation.watchPosition(onSuccess, onErrorWithFallback, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
    });

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (!isMounted) return;
      const heading = (event as any).webkitCompassHeading ?? event.alpha;
      if (heading !== null && heading !== undefined) {
        setState(prevState => {
          if (prevState.data) {
            return {
              ...prevState,
              data: {
                ...prevState.data,
                heading: heading,
              }
            };
          }
          return prevState;
        });
      }
    };
    
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    
    return () => {
        isMounted = false;
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