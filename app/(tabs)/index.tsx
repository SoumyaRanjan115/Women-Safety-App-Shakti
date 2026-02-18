import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ContactService } from "../../src/services/ContactService";
import { DangerScoreService } from "../../src/services/DangerScoreService";
import { ensureUser, syncContactsToCloud } from "../../src/services/firebaseService";
import { LocationService } from "../../src/services/LocationService";
import { SmsService } from "../../src/services/SmsService";
import SosSoundService from "../../src/services/SosSoundService";
import { DangerScoreResult } from "../../src/types";
// Actually LinearGradient is standard in Expo but let's check package.json. 
// User said "Do NOT replace native APIs". I'll use standard Views to be safe or check imports.
// package.json doesn't show expo-linear-gradient explicitly in the view_file output I saw earlier (it showed expo ~54, etc).
// To be safe, I will simulate the gradient or just use solid colors as per "Dark theme" requirement.

export default function HomeScreen() {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [dangerResult, setDangerResult] = useState<DangerScoreResult | null>(null);

  // Animation for Pulse
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const fetchDangerScore = async () => {
    try {
      console.log("Fetching Danger Score...");
      const user = await ensureUser();
      const location = await LocationService.getCurrentLocation();
      const result = await DangerScoreService.calculateDangerScore(user.uid, location);
      console.log("Danger Score Result:", result);
      setDangerResult(result);
    } catch (err) {
      console.warn("Failed to fetch danger score:", err);
    }
  };

  useEffect(() => {
    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start();
    };
    startPulse();

    // Fetch initial danger score
    fetchDangerScore();

    // Cleanup sound on unmount
    return () => {
      SosSoundService.stopAlarm();
    };
  }, []);



  const toggleAlarm = async () => {
    if (isAlarmActive) {
      await SosSoundService.stopAlarm();
      setIsAlarmActive(false);
    } else {
      // Confirm before starting alarm manually? Or just start?
      // For now, if toggle is used, it just starts.
      // But main entry point is onSOSPress which triggers both.
      await SosSoundService.startAlarm();
      setIsAlarmActive(true);
    }
  };

  const onSOSPress = async () => {
    console.log("SOS CLICKED");
    if (sending) return;

    // Start Alarm Immediately
    if (!isAlarmActive) {
      await SosSoundService.startAlarm();
      setIsAlarmActive(true);
    }

    try {
      setSending(true);

      // 1️⃣ Ensure Firebase user
      const user = await ensureUser();

      // 2️⃣ Load contacts from secure storage
      const contacts = await ContactService.loadContacts();

      if (!contacts || contacts.length === 0) {
        Alert.alert(
          "No Emergency Contacts",
          "Please add at least one emergency contact."
        );
        return;
      }

      // 3️⃣ Sync contacts to Firebase (non-blocking safety net)
      syncContactsToCloud(user.uid, contacts).catch(() => { });

      // 4️⃣ Get current location & Calculate Danger Score
      const location = await LocationService.getCurrentLocation();
      const scoreResult = await DangerScoreService.calculateDangerScore(user.uid, location);
      setDangerResult(scoreResult); // Update UI

      // Log to Firestore
      DangerScoreService.saveSosLog(user.uid, location, scoreResult).catch(console.error);

      // 5️⃣ Build Google Maps link
      const mapsLink = LocationService.getGoogleMapsLink(
        location.lat,
        location.lng
      );

      // 6️⃣ Send SOS SMS
      await SmsService.sendEmergencySms(contacts, mapsLink);

      Alert.alert(
        "SOS Sent",
        "Emergency message with your live location has been sent.",
        [
          { text: "OK" },
          { text: "Stop Alarm", onPress: () => toggleAlarm(), style: "destructive" }
        ]
      );

      // Auto-navigate to tracking to ensure updates continue
      router.push("/(tabs)/tracking");
    } catch (err: any) {
      console.error("SOS failed:", err);
      Alert.alert(
        "SOS Failed",
        err?.message ||
        "Unable to send SOS. Please check permissions and try again."
      );
    } finally {
      setSending(false);
    }
  };

  const menuItems = [
    { title: "Helplines", icon: "shield.fill", route: "/(tabs)/helplines" },
    { title: "Check-in", icon: "map.fill", route: "/(tabs)/tracking" }, // Tracking
    { title: "Guardians", icon: "person.2.fill", route: "/(tabs)/contacts" },
    { title: "Fake Call", icon: "phone.fill", route: "/(tabs)/fake" }, // Changed from Stealth SMS to Fake Call as requested
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>

      {/* Top Status Card */}

      <View style={[
        styles.statusCard,
        dangerResult?.level === 'HIGH' && styles.statusCardHigh,
        dangerResult?.level === 'CAUTION' && styles.statusCardCaution,
        dangerResult?.level === 'SAFE' && styles.statusCardSafe
      ]}>
        <View style={[
          styles.statusIcon,
          dangerResult?.level === 'HIGH' && styles.statusIconHigh,
          dangerResult?.level === 'CAUTION' && styles.statusIconCaution,
          dangerResult?.level === 'SAFE' && styles.statusIconSafe
        ]}>
          <IconSymbol
            name={dangerResult?.level === 'HIGH' ? "exclamationmark.triangle.fill" : (dangerResult?.level === 'CAUTION' ? "hand.raised.fill" : "shield.fill")}
            size={32}
            color={dangerResult?.level === 'HIGH' ? "#ef4444" : (dangerResult?.level === 'CAUTION' ? "#facc15" : "#16a34a")}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.statusTitle}>
            {dangerResult ? (dangerResult.level === 'SAFE' ? "You are Safe" : `Risk Level: ${dangerResult.level}`) : "Analyzing Status..."}
          </Text>
          <Text style={styles.statusSubtitle}>
            {dangerResult
              ? `Score: ${dangerResult.score}/100${dangerResult.reasons.length > 0 ? '\n' + dangerResult.reasons.join(', ') : ''}`
              : "Checking environment..."}
          </Text>
        </View>
      </View>

      {/* SOS Button Area */}
      <View style={styles.sosContainer}>
        <View style={styles.pulseContainer}>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.1],
                  outputRange: [0.3, 0],
                }),
              },
            ]}
          />
          <Pressable
            style={({ pressed }) => [
              styles.sosButton,
              isAlarmActive && styles.sosButtonActive,
              pressed && styles.sosButtonPressed,
            ]}
            onPress={isAlarmActive ? toggleAlarm : onSOSPress}
          >
            <View style={styles.sosInner}>
              <IconSymbol
                name={isAlarmActive ? "speaker.slash.fill" : "exclamationmark.triangle.fill"}
                size={40}
                color="#fff"
              />
              <Text style={styles.sosText}>
                {isAlarmActive ? "STOP" : (sending ? "SENDING..." : "SOS")}
              </Text>
            </View>
          </Pressable>
        </View>
        <Text style={styles.sosHint}>Press for Emergency SOS</Text>
      </View>

      {/* Safety Grid */}
      <View style={styles.gridContainer}>
        <Text style={styles.gridHeader}>Safety Features</Text>
        <View style={styles.grid}>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [styles.gridItem, pressed && styles.gridItemPressed]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.gridIcon}>
                <IconSymbol name={item.icon as any} size={28} color="#fff" />
              </View>
              <Text style={styles.gridTitle}>{item.title}</Text>
            </Pressable>
          ))}
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scrollContainer: {
    padding: 24,
    paddingTop: 60,
  },
  // Status Card
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statusIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  statusSubtitle: {
    fontSize: 14,
    color: "#94a3b8",
  },
  statusCardHigh: {
    borderColor: "#ef4444",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  statusCardCaution: {
    borderColor: "#facc15",
    backgroundColor: "rgba(250, 204, 21, 0.1)",
  },
  statusCardSafe: {
    borderColor: "#16a34a",
    backgroundColor: "rgba(22, 163, 74, 0.1)",
  },
  statusIconHigh: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  statusIconCaution: {
    backgroundColor: "rgba(250, 204, 21, 0.2)",
  },
  statusIconSafe: {
    backgroundColor: "rgba(22, 163, 74, 0.2)",
  },

  // SOS Button
  sosContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  pulseContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 250,
    height: 250,
  },
  pulseRing: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(239, 68, 68, 0.5)",
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    elevation: 20,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    borderWidth: 8,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  sosButtonActive: {
    backgroundColor: "#b91c1c", // Darker red for active state or maybe pulse?
    borderColor: "#fff",
    borderWidth: 4,
  },
  sosButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  sosInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  sosText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#ffffff",
    marginTop: 8,
    letterSpacing: 2,
  },
  sosHint: {
    color: "#64748b",
    marginTop: 16,
  },

  // Grid
  gridContainer: {
    flex: 1,
  },
  gridHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  gridItem: {
    width: "47%",
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  gridItemPressed: {
    backgroundColor: "#334155",
  },
  gridIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  gridTitle: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
