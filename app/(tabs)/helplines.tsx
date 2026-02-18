import { IconSymbol } from "@/components/ui/icon-symbol";
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from "react-native";

const HELPLINES = [
    { id: "1", name: "Police", number: "112", icon: "shield.fill" },
    { id: "2", name: "Women Helpline", number: "181", icon: "person.fill" },
    { id: "3", name: "Ambulance", number: "108", icon: "staroflife.fill" },
    { id: "4", name: "National Emergency", number: "112", icon: "exclamationmark.triangle.fill" },
];

export default function HelplinesScreen() {
    const callNumber = (number: string) => {
        Linking.openURL(`tel:${number}`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Helplines</Text>
            <Text style={styles.subtitle}>Tap to call immediately</Text>

            <FlatList
                data={HELPLINES}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <Pressable
                        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                        onPress={() => callNumber(item.number)}
                    >
                        <View style={styles.iconBox}>
                            {/* Casting icon name for simplicity as we know these exist or map to fallback */}
                            <IconSymbol name={item.icon as any} size={28} color="#fff" />
                        </View>
                        <View style={styles.info}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.number}>{item.number}</Text>
                        </View>
                        <IconSymbol name="phone.fill" size={24} color="#22c55e" />
                    </Pressable>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#94a3b8",
        marginBottom: 24,
    },
    list: {
        gap: 16,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1e293b",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#334155",
    },
    cardPressed: {
        backgroundColor: "#334155",
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#0f172a",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 4,
    },
    number: {
        fontSize: 14,
        color: "#22c55e",
        fontWeight: "bold",
    },
});
