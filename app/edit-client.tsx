import { useEffect, useState } from "react";
import { View, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { supabase } from "./services/supabase";
import { useClient } from "./features/clients/hooks/useClient";

export default function EditClient() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const { client, loading, save } = useClient(id);

  useEffect(() => {
    if (!client) return;

    setFirstName(client.first_name);
    setLastName(client.last_name);
    setPhone(client.phone ?? "");
    setEmail(client.email ?? "");
  }, [client]);

  const handleSave = async () => {
    const success = await save({
      first_name: firstName,
      last_name: lastName,
      phone,
      email,
    });

    if (!success) {
      Alert.alert("Errore", "Impossibile salvare");
      return;
    }

    Alert.alert("Salvato", "Cliente aggiornato con successo");
    router.back();
  };

  if (loading) return null;

  return (
    <View style={styles.container}>
      <ThemedText type="title">Modifica Cliente</ThemedText>

      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Nome"
        style={styles.input}
      />
      <TextInput
        value={lastName}
        onChangeText={setLastName}
        placeholder="Cognome"
        style={styles.input}
      />
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="Telefono"
        style={styles.input}
      />
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
        keyboardType="email-address"
      />

      <Pressable style={styles.button} onPress={handleSave}>
        <ThemedText>Salva modifiche</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#888",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
});
