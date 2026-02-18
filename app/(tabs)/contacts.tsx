import { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ContactService, isValidPhoneNumber } from "../../src/services/ContactService";
import { ensureUser, syncContactsToCloud } from "../../src/services/firebaseService";


type Contact = {
  id: string;
  name: string;
  phone: string;
  isEmergency: boolean;
};

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const stored = await ContactService.loadContacts();
    setContacts(stored);
  };

  const addContact = async () => {
    if (!name || !phone) {
      Alert.alert("Error", "Name and phone are required");
      return;
    }

    if (!isValidPhoneNumber(phone)) {
      Alert.alert("Invalid phone number");
      return;
    }

    if (ContactService.hasDuplicatePhone(contacts, phone)) {
      Alert.alert("Duplicate contact");
      return;
    }


    const newContact: Contact = {
      id: Date.now().toString(),
      name,
      phone,
      isEmergency: true,
    };

    const updated = [...contacts, newContact];
    setContacts(updated);
    await ContactService.saveContacts(updated);

    // Sync to Firebase silently
    try {
      const user = await ensureUser();
      syncContactsToCloud(user.uid, updated);
    } catch { }

    setName("");
    setPhone("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>

      <View style={styles.form}>
        <TextInput
          placeholder="Name"
          placeholderTextColor="#94a3b8"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Phone number"
          placeholderTextColor="#94a3b8"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />
        <Pressable style={styles.addButton} onPress={addContact}>
          <Text style={styles.addText}>Add Contact</Text>
        </Pressable>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 20 }}
        renderItem={({ item }) => (
          <View style={styles.contactCard}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactPhone}>{item.phone}</Text>
            <Text style={styles.emergencyTag}>Emergency</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No contacts added yet.</Text>
        }
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  form: {
    backgroundColor: "#020617",
    padding: 16,
    borderRadius: 12,
  },
  input: {
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#22c55e",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  addText: {
    color: "#022c22",
    fontWeight: "bold",
  },
  contactCard: {
    backgroundColor: "#020617",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  contactName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  contactPhone: {
    color: "#cbd5e1",
    marginTop: 4,
  },
  emergencyTag: {
    marginTop: 6,
    color: "#ef4444",
    fontSize: 12,
  },
  empty: {
    color: "#64748b",
    textAlign: "center",
    marginTop: 40,
  },
});
