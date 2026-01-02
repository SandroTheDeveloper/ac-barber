import { useState, useEffect } from "react";
import { View, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/app/utils/supabase";
import { ThemedText } from "@/components/themed-text";

export default function UpdatePassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verifica che l'utente sia autenticato tramite il link
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        Alert.alert("Errore", "Link non valido o scaduto");
        router.replace("/login");
      }
    });
  }, []);

  const handleUpdate = async () => {
    if (!password || !confirmPassword) {
      return Alert.alert("Compila tutti i campi");
    }

    if (password !== confirmPassword) {
      return Alert.alert("Le password non coincidono");
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      Alert.alert("Errore", error.message);
    } else {
      Alert.alert("Password aggiornata", "Ora puoi fare il login");
      router.replace("/login");
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title">Aggiorna Password</ThemedText>

      <TextInput
        placeholder="Nuova Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <TextInput
        placeholder="Conferma Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
        secureTextEntry
      />

      <Pressable
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleUpdate}
        disabled={loading}
      >
        <ThemedText>
          {loading ? "Aggiornamento..." : "Aggiorna Password"}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
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
