import { useState } from "react";
import { View, TextInput, Pressable, Alert } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Stack } from "expo-router";
import { supabase } from "../services/supabase";
import { styles } from "./styles";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      return Alert.alert("Inserisci la tua email");
    }

    setLoading(true);

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:8081/update-password",
    });

    if (error) {
      Alert.alert("Errore", error.message);
    } else {
      Alert.alert(
        "Email inviata",
        "Controlla la tua email per resettare la password"
      );
    }

    setLoading(false);
  };

  return (
    <>
      {" "}
      <Stack.Screen
        options={{
          title: "Torna indietro",
          headerBackTitle: "Indietro", // iOS
        }}
      />
      <View style={styles.container}>
        <ThemedText type="title">Inserisci la tua mail</ThemedText>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Pressable
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleReset}
          disabled={loading}
        >
          <ThemedText>{loading ? "Invio..." : "Ricevi link"}</ThemedText>
        </Pressable>
      </View>
    </>
  );
}
