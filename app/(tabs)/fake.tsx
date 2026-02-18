import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, Vibration, View } from "react-native";

export default function FakeCallScreen() {
    const router = useRouter();
    const [active, setActive] = useState(false);
    const [timer, setTimer] = useState<number | null>(null);

    // Mock entry - in a real app this would selection triggers
    const startFakeCallTimer = () => {
        // 5 seconds delay
        setTimer(5);
    };

    useEffect(() => {
        if (timer === null) return;

        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => (prev ? prev - 1 : 0));
            }, 1000);
            return () => clearInterval(interval);
        } else {
            triggerCall();
        }
    }, [timer]);

    const triggerCall = () => {
        setActive(true);
        setTimer(null);
        Vibration.vibrate([0, 500, 1000, 500], true); // Vibrate pattern
        // In real app, play ringtone here
    };

    const endCall = () => {
        Vibration.cancel();
        setActive(false);
        // Go back or stay?
        // router.back(); 
    };

    if (active) {
        return (
            <View style={styles.callContainer}>
                <View style={styles.callerInfo}>
                    <View style={styles.avatarPlaceholder}>
                        <IconSymbol name="person.fill" size={60} color="#fff" />
                    </View>
                    <Text style={styles.callerName}>Mom</Text>
                    <Text style={styles.callerNumber}>Mobile</Text>
                </View>

                <View style={styles.actions}>
                    <Pressable style={styles.declineBtn} onPress={endCall}>
                        <IconSymbol name="phone.down.fill" size={32} color="#fff" />
                        <Text style={styles.btnLabel}>Decline</Text>
                    </Pressable>

                    <Pressable style={styles.acceptBtn} onPress={endCall}>
                        <IconSymbol name="phone.fill" size={32} color="#fff" />
                        <Text style={styles.btnLabel}>Accept</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.setupContainer}>
            <Text style={styles.title}>Fake Call</Text>
            <Text style={styles.desc}>
                Schedule a fake incoming call to escape an awkward or unsafe situation.
            </Text>

            {timer !== null ? (
                <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>Ring in {timer}s...</Text>
                    <Pressable onPress={() => setTimer(null)} style={styles.cancelBtn}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </Pressable>
                </View>
            ) : (
                <Pressable style={styles.triggerBtn} onPress={startFakeCallTimer}>
                    <Text style={styles.triggerText}>Trigger in 5s</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    // Setup Styles
    setupContainer: {
        flex: 1,
        backgroundColor: "#0f172a",
        padding: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 28,
        color: "#fff",
        fontWeight: "bold",
        marginBottom: 16,
    },
    desc: {
        color: "#cbd5e1",
        textAlign: "center",
        marginBottom: 40,
        fontSize: 16,
    },
    triggerBtn: {
        backgroundColor: "#3b82f6",
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
    },
    triggerText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
    },
    timerContainer: {
        alignItems: "center",
        gap: 20,
    },
    timerText: {
        color: "#22c55e",
        fontSize: 24,
        fontWeight: "bold",
    },
    cancelBtn: {
        padding: 10,
    },
    cancelText: {
        color: "#ef4444",
        fontSize: 16,
    },

    // In-Call Styles
    callContainer: {
        flex: 1,
        backgroundColor: "#000",
        paddingVertical: 80,
        justifyContent: "space-between",
    },
    callerInfo: {
        alignItems: "center",
        marginTop: 60,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#334155",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    callerName: {
        fontSize: 32,
        color: "#fff",
        fontWeight: "500",
        marginBottom: 8,
    },
    callerNumber: {
        fontSize: 18,
        color: "#94a3b8",
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 40,
        marginBottom: 40,
    },
    declineBtn: {
        alignItems: "center",
        gap: 8,
        backgroundColor: "#ef4444",
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: "center",
    },
    acceptBtn: {
        alignItems: "center",
        gap: 8,
        backgroundColor: "#22c55e",
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: "center",
    },
    btnLabel: {
        color: "#fff",
        marginTop: 8,
        fontSize: 14,
        position: "absolute",
        bottom: -30,
    },
});
