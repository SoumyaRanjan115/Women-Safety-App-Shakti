import * as Location from 'expo-location';
import { UserLocation } from '../types';

export const LocationService = {
  async getCurrentLocation(): Promise<UserLocation> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error(
          'Location permission denied. Enable location to use SOS tracking.'
        );
      }

      // 1) Try fast last-known position
      let position = await Location.getLastKnownPositionAsync();

      // 2) Fallback to current GPS with timeout
      if (!position) {
        position = (await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          }),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error('Location timeout – unable to get GPS.')),
              15000
            )
          ),
        ])) as Location.LocationObject;
      }

      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp ?? Date.now(),
        speed: position.coords.speed, // Capture speed (m/s)
      };
    } catch (err: any) {
      console.error('[LocationService] Failed to get location', err);
      throw new Error(
        err?.message ||
        'Unable to get your location. Check GPS and try again.'
      );
    }
  },

  getGoogleMapsLink(lat: number, lng: number): string {
    return `https://maps.google.com/?q=${lat},${lng}`;
  },
};


