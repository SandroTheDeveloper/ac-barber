import { useEffect, useState } from "react";
import { View, TextInput, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { useClient } from "../features/clients/hooks/useClient";
import { styles } from "./styles";
import { ButtonConfirm } from "@/components/ui/button/ButtonConfirm";
import { ButtonCancel } from "@/components/ui/button/ButtonCancel";

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

      <ButtonConfirm onPress={handleSave} message="Conferma"></ButtonConfirm>
      <ButtonCancel />
    </View>
  );
}
