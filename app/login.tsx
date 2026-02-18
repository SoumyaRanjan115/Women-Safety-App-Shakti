import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AuthService } from "../src/services/AuthService";

export default function LoginScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password.");
            return;
        }

        setLoading(true);
        try {
            if (isSignUp) {
                await AuthService.signUpWithEmail(email, password);
                Alert.alert("Success", "Account created successfully!", [
                    { text: "OK", onPress: () => router.replace("/(tabs)") }
                ]);
            } else {
                await AuthService.signInWithEmail(email, password);
                router.replace("/(tabs)");
            }
        } catch (error: any) {
            let message = error.message;
            if (error.code === 'auth/email-already-in-use') {
                message = "That email address is already in use!";
            } else if (error.code === 'auth/invalid-email') {
                message = "That email address is invalid!";
            } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                message = "Invalid email or password.";
            }
            Alert.alert("Authentication Failed", message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <IconSymbol name="shield.fill" size={80} color="#ef4444" />
                    <Text style={styles.title}>Shakti</Text>
                    <Text style={styles.subtitle}>Women Safety App</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.description}>
                        {isSignUp ? "Create an account to get started." : "Sign in to access emergency features."}
                    </Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#94a3b8"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#94a3b8"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <Pressable
                        style={({ pressed }) => [
                            styles.authButton,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={handleAuth}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#0f172a" />
                        ) : (
                            <Text style={styles.buttonText}>{isSignUp ? "Create Account" : "Login"}</Text>
                        )}
                    </Pressable>

                    <Pressable onPress={() => setIsSignUp(!isSignUp)}>
                        <Text style={styles.switchAuthText}>
                            {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: "center",
    },
    header: {
        alignItems: "center",
        marginBottom: 48,
    },
    title: {
        fontSize: 40,
        fontWeight: "900",
        color: "#fff",
        marginTop: 16,
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 18,
        color: "#94a3b8",
        marginTop: 8,
    },
    content: {
        alignItems: "center",
        gap: 24,
    },
    description: {
        color: "#cbd5e1",
        textAlign: "center",
        fontSize: 16,
        marginBottom: 8,
    },
    inputContainer: {
        width: "100%",
        gap: 16,
    },
    input: {
        backgroundColor: "#1e293b",
        color: "#fff",
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#334155",
    },
    authButton: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ef4444", // Using the app's primary red color
        paddingVertical: 16,
        borderRadius: 30,
        width: "100%",
        elevation: 4,
        marginTop: 8,
    },
    buttonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    switchAuthText: {
        color: "#94a3b8",
        fontSize: 14,
        marginTop: 16,
    },
});
