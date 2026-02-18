import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { AuthService } from "../../src/services/AuthService";

export default function SettingsScreen() {
    const router = useRouter();
    const [shakeEnabled, setShakeEnabled] = useState(false);
    const [fakeCallEnabled, setFakeCallEnabled] = useState(true);

    // In a real app, load these from SecureStore/AsyncStorage on mount

    const toggleShake = () => setShakeEnabled(prev => !prev);
    const toggleFakeCall = () => setFakeCallEnabled(prev => !prev);

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout", style: "destructive", onPress: async () => {
                    try {
                        await AuthService.signOut();
                        // Router listener in _layout handles redirect
                    } catch (error) {
                        Alert.alert("Logout Failed");
                    }
                }
            },
        ]);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Settings</Text>

            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Safety Features</Text>

                <View style={styles.row}>
                    <View style={styles.rowInfo}>
                        <Text style={styles.rowTitle}>Shake to SOS</Text>
                        <Text style={styles.rowSubtitle}>Shake phone to trigger emergency alert</Text>
                    </View>
                    <Switch
                        value={shakeEnabled}
                        onValueChange={toggleShake}
                        trackColor={{ false: "#334155", true: "#22c55e" }}
                        thumbColor="#fff"
                    />
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <View style={styles.rowInfo}>
                        <Text style={styles.rowTitle}>Fake Call Trigger</Text>
                        <Text style={styles.rowSubtitle}>Show fake call option on home screen</Text>
                    </View>
                    <Switch
                        value={fakeCallEnabled}
                        onValueChange={toggleFakeCall}
                        trackColor={{ false: "#334155", true: "#22c55e" }}
                        thumbColor="#fff"
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Account</Text>
                <Pressable style={styles.linkRow} onPress={() => router.push("/(tabs)/contacts")}>
                    <Text style={styles.linkText}>Manage Emergency Contacts</Text>
                    <IconSymbol name="chevron.right" size={20} color="#64748b" />
                </Pressable>
                <View style={styles.divider} />
                <Pressable style={styles.linkRow} onPress={handleLogout}>
                    <Text style={[styles.linkText, styles.textDanger]}>Log Out</Text>
                </Pressable>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionHeader}>App Info</Text>
                <View style={styles.row}>
                    <Text style={styles.rowTitle}>Version</Text>
                    <Text style={styles.rowValue}>1.0.0</Text>
                </View>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
        padding: 20,
    },
    header: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 24,
    },
    section: {
        marginBottom: 32,
        backgroundColor: "#1e293b",
        borderRadius: 16,
        overflow: "hidden",
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#94a3b8",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        textTransform: "uppercase",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
    },
    rowInfo: {
        flex: 1,
        paddingRight: 16,
    },
    rowTitle: {
        fontSize: 16,
        fontWeight: "500",
        color: "#fff",
        marginBottom: 4,
    },
    rowSubtitle: {
        fontSize: 13,
        color: "#94a3b8",
    },
    rowValue: {
        fontSize: 16,
        color: "#94a3b8",
    },
    divider: {
        height: 1,
        backgroundColor: "#334155",
        marginLeft: 16,
    },
    linkRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
    },
    linkText: {
        fontSize: 16,
        color: "#fff",
    },
    textDanger: {
        color: "#ef4444",
    },
});
