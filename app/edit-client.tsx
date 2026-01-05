import { useEffect, useState } from "react";
import { View, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/app/utils/supabase";
import { ThemedText } from "@/components/themed-text";

export default function EditClient() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadClient = async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        Alert.alert("Errore", error.message);
        router.back();
        return;
      }

      setFirstName(data.first_name);
      setLastName(data.last_name);
      setPhone(data.phone ?? "");
      setEmail(data.email ?? "");
      setLoading(false);
    };

    loadClient();
  }, [id]);

  const handleSave = async () => {
    const { error } = await supabase
      .from("clients")
      .update({
        first_name: firstName,
        last_name: lastName,
        phone,
        email,
      })
      .eq("id", id);

    if (error) {
      Alert.alert("Errore", error.message);
    } else {
      Alert.alert("Salvato", "Cliente aggiornato");
      router.back();
    }
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
