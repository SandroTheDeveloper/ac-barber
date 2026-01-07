import { useEffect, useState } from "react";
import { View, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/app/utils/supabase";
import { ThemedText } from "@/components/themed-text";

export default function EditAppointment() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [service, setService] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadAppointments = async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        Alert.alert("Errore", error.message);
        router.back();
        return;
      }

      setDay(data.appointment_date);
      setHour(data.appointment_time);
      setService(data.service);
    };

    loadAppointments();
  }, [id]);

  const handleSave = async () => {
    const { error } = await supabase
      .from("appointments")
      .update({
        first_name: firstName,
        last_name: lastName,
      })
      .eq("id", id);

    if (error) {
      Alert.alert("Errore", error.message);
    } else {
      Alert.alert("Salvato", "Appuntamento aggiornato");
      router.back();
    }
  };

  if (loading) return null;

  return (
    <View style={styles.container}>
      <ThemedText type="title">Modifica Cliente</ThemedText>

      <TextInput value={firstName} placeholder="Nome" style={styles.input} />
      <TextInput value={lastName} placeholder="Cognome" style={styles.input} />
      <TextInput
        value={service}
        onChangeText={setService}
        placeholder="Servizio"
        style={styles.input}
      />
      <TextInput
        value={day}
        onChangeText={setDay}
        placeholder="Giorno"
        style={styles.input}
      />
      <TextInput
        value={hour}
        onChangeText={setHour}
        placeholder="Giorno"
        style={styles.input}
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
