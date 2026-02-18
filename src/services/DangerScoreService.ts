import { addDoc, collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { DangerScoreResult, UserLocation } from '../types';
import { getDb } from './firebaseService';

// Constants for Risk Weights
const RISK_WEIGHTS = {
    TIME_LATE_NIGHT: 25, // 11 PM - 4 AM
    TIME_EARLY_MORNING: 15, // 4 AM - 6 AM
    SPEED_HIGH: 20, // > 25 km/h
    SPEED_SUDDEN_CHANGE: 15, // Not implemented fully without history tracking, but placeholder logic
    SAFE_ZONE_ABSENT: 15, // No safe zone nearby
    PAST_INCIDENT_NEARBY: 20, // SOS within 500m
};

export const DangerScoreService = {
    /**
     * Calculates the danger score based on time, speed, location, and past history.
     */
    async calculateDangerScore(
        userId: string,
        location: UserLocation
    ): Promise<DangerScoreResult> {
        let score = 0;
        const reasons: string[] = [];

        // 1. Time-based Risk
        const date = new Date(location.timestamp);
        const hour = date.getHours();

        if (hour >= 23 || hour < 4) {
            score += RISK_WEIGHTS.TIME_LATE_NIGHT;
            reasons.push('Late night (11 PM - 4 AM)');
        } else if (hour >= 4 && hour < 6) {
            score += RISK_WEIGHTS.TIME_EARLY_MORNING;
            reasons.push('Early morning (4 AM - 6 AM)');
        }

        // 2. Speed-based Risk
        // Speed is in m/s. 25 km/h ≈ 6.94 m/s.
        const speedKmh = (location.speed || 0) * 3.6;
        if (speedKmh > 25) {
            score += RISK_WEIGHTS.SPEED_HIGH;
            reasons.push(`High speed (${speedKmh.toFixed(1)} km/h)`);
        }

        // 3. Location-based Risk (Safe Zone Check)
        // For now, checks if NO safe zone is nearby.
        // Placeholder: Assume 15 points risk if "not home" (mock logic for now).
        // In real app, check against user-defined safe zones.
        const isSafeZone = false; // Mock: assume not in safe zone for now
        if (!isSafeZone) {
            score += RISK_WEIGHTS.SAFE_ZONE_ABSENT;
            reasons.push('Outside known safe zone');
        }

        // 4. Past Incident Risk (Firestore)
        try {
            const db = getDb();
            // Query last 10 SOS logs for this user to check history
            // Note: Ideally we check ALL users' SOS logs for "high crime area" detection,
            // but requirements said "Fetch previous SOS logs from users/{uid}/sosLogs".
            // This implies checking user's OWN history.
            const logsRef = collection(db, 'users', userId, 'sosLogs');
            const q = query(logsRef, orderBy('timestamp', 'desc'), limit(10));
            const querySnapshot = await getDocs(q);

            let incident_nearby = false;
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.lat && data.lng) {
                    const distance = getDistanceFromLatLonInKm(
                        location.lat,
                        location.lng,
                        data.lat,
                        data.lng
                    );
                    if (distance <= 0.5) { // 500m
                        incident_nearby = true;
                    }
                }
            });

            if (incident_nearby) {
                score += RISK_WEIGHTS.PAST_INCIDENT_NEARBY;
                reasons.push('Previous SOS incident nearby');
            }
        } catch (err) {
            console.warn('[DangerScore] Failed to fetch past incidents:', err);
            // Graceful fallback: do not add risk score if DB fails
        }

        // Cap score at 100
        score = Math.min(score, 100);

        return {
            score,
            level: getDangerLevel(score),
            reasons,
        };
    },

    /**
     * Logs the SOS event with danger details to Firestore.
     */
    async saveSosLog(
        userId: string,
        location: UserLocation,
        dangerResult: DangerScoreResult
    ): Promise<void> {
        try {
            const db = getDb();
            const logsRef = collection(db, 'users', userId, 'sosLogs');

            await addDoc(logsRef, {
                timestamp: location.timestamp,
                lat: location.lat,
                lng: location.lng,
                speed: location.speed ?? 0,
                accuracy: location.accuracy,
                dangerScore: dangerResult.score,
                dangerLevel: dangerResult.level,
                dangerReasons: dangerResult.reasons,
            });
            console.log('[DangerScore] SOS event logged successfully.');
        } catch (err) {
            console.error('[DangerScore] Failed to log SOS event:', err);
        }
    }
};

// Helper: Determine Level
function getDangerLevel(score: number): 'SAFE' | 'CAUTION' | 'HIGH' {
    if (score <= 30) return 'SAFE';
    if (score <= 60) return 'CAUTION';
    return 'HIGH';
}

// Helper: Haversine Distance
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}
