import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";

export default function TrackingScreen() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);

    useEffect(() => {
        // Start tracking automatically when screen mounts
        startTracking();

        return () => {
            // Cleanup
            if (subscription) {
                subscription.remove();
            }
        };
    }, []);

    const startTracking = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setErrorMsg("Permission to access location was denied");
                return;
            }

            setIsTracking(true);
            setErrorMsg(null);

            // Watch position
            const sub = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 10, // Update every 10 meters
                    timeInterval: 5000,   // Or every 5 seconds
                },
                (newLocation) => {
                    setLocation(newLocation);
                }
            );
            setSubscription(sub);
        } catch (err) {
            setErrorMsg("Failed to start tracking");
            setIsTracking(false);
        }
    };

    const stopTracking = () => {
        if (subscription) {
            subscription.remove();
            setSubscription(null);
        }
        setIsTracking(false);
    };

    const openMap = () => {
        if (!location) return;
        const { latitude, longitude } = location.coords;
        const url = Platform.select({
            ios: `maps:${latitude},${longitude}`,
            android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
        });
        if (url) {
            Linking.openURL(url);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Live Tracking</Text>

            <View style={styles.card}>
                <View style={styles.statusRow}>
                    <View style={[styles.dot, isTracking ? styles.dotActive : styles.dotInactive]} />
                    <Text style={styles.statusText}>
                        Status: {isTracking ? "TRACKING ACTIVE" : "STOPPED"}
                    </Text>
                </View>

                {errorMsg ? (
                    <Text style={styles.errorText}>{errorMsg}</Text>
                ) : location ? (
                    <View style={styles.coordsContainer}>
                        <View style={styles.coordItem}>
                            <Text style={styles.coordLabel}>LATITUDE</Text>
                            <Text style={styles.coordValue}>{location.coords.latitude.toFixed(6)}</Text>
                        </View>
                        <View style={styles.coordItem}>
                            <Text style={styles.coordLabel}>LONGITUDE</Text>
                            <Text style={styles.coordValue}>{location.coords.longitude.toFixed(6)}</Text>
                        </View>
                        <Text style={styles.lastUpdated}>
                            Last updated: {new Date(location.timestamp).toLocaleTimeString()}
                        </Text>
                    </View>
                ) : (
                    <Text style={styles.waitingText}>Waiting for GPS signal...</Text>
                )}
            </View>

            <View style={styles.actions}>
                <Pressable
                    style={[styles.button, isTracking ? styles.buttonStop : styles.buttonStart]}
                    onPress={isTracking ? stopTracking : startTracking}
                >
                    <IconSymbol
                        size={24}
                        name={isTracking ? "stop.fill" : "play.fill"}
                        color="#fff"
                    />
                    <Text style={styles.buttonText}>{isTracking ? "Stop Tracking" : "Start Tracking"}</Text>
                </Pressable>

                <Pressable
                    style={[styles.button, styles.buttonMap, !location && styles.buttonDisabled]}
                    onPress={openMap}
                    disabled={!location}
                >
                    <IconSymbol
                        size={24}
                        name="map.fill"
                        color={location ? "#fff" : "#94a3b8"}
                    />
                    <Text style={[styles.buttonText, !location && styles.textDisabled]}>
                        View on Map
                    </Text>
                </Pressable>
            </View>

            <Text style={styles.hint}>
                Keep this screen open for continuous updates.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 30,
    },
    card: {
        width: "100%",
        backgroundColor: "#1e293b",
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        backgroundColor: "#0f172a",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    dotActive: {
        backgroundColor: "#22c55e",
        shadowColor: "#22c55e",
        shadowOpacity: 0.8,
        shadowRadius: 6,
        elevation: 10,
    },
    dotInactive: {
        backgroundColor: "#ef4444",
    },
    statusText: {
        color: "#fff",
        fontWeight: "700",
        letterSpacing: 1,
        fontSize: 14,
    },
    coordsContainer: {
        width: "100%",
        alignItems: "center",
    },
    coordItem: {
        marginBottom: 10,
        alignItems: "center",
    },
    coordLabel: {
        color: "#94a3b8",
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 4,
    },
    coordValue: {
        color: "#fff",
        fontSize: 28,
        fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
        fontWeight: "bold",
    },
    lastUpdated: {
        marginTop: 10,
        color: "#64748b",
        fontSize: 12,
    },
    waitingText: {
        color: "#64748b",
        fontStyle: "italic",
        paddingVertical: 20,
    },
    errorText: {
        color: "#ef4444",
        paddingVertical: 20,
        textAlign: "center",
    },
    actions: {
        width: "100%",
        gap: 16,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 12,
        gap: 10,
    },
    buttonStart: {
        backgroundColor: "#22c55e",
    },
    buttonStop: {
        backgroundColor: "#ef4444",
    },
    buttonMap: {
        backgroundColor: "#3b82f6",
    },
    buttonDisabled: {
        backgroundColor: "#334155",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    textDisabled: {
        color: "#94a3b8",
    },
    hint: {
        marginTop: 20,
        color: "#64748b",
        fontSize: 12,
        textAlign: "center",
    },
});
