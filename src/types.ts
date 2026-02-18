export interface Contact {
  id: string;
  name: string;
  phone: string;
  isEmergency: boolean;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number | null;
  timestamp: number;
  speed?: number | null; // Added for Danger Score
}

// Danger Score Types
export type DangerLevel = 'SAFE' | 'CAUTION' | 'HIGH';

export interface DangerScoreResult {
  score: number;
  level: DangerLevel;
  reasons: string[]; // Debug/UI feedback
}

export interface SosLog {
  timestamp: number;
  lat: number;
  lng: number;
  score: number;
  level: DangerLevel;
}
