import { useState } from "react";
import { View, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { supabase } from "../services/supabase";
import { styles } from "./styles";

const DEFAULT_PASSWORD = "esplosionecapelli26";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Inserisci email e password");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Errore", error.message);
      return;
    }

    // ✅ Se la password è quella di default, vai subito a update-password
    if (password === DEFAULT_PASSWORD) {
      router.replace(`/update-password?email=${encodeURIComponent(email)}`);
      return;
    }

    // ✅ Altrimenti vai ai tabs
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title">Accedi</ThemedText>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Pressable
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <ThemedText>{loading ? "Accesso..." : "Login"}</ThemedText>
      </Pressable>
    </View>
  );
}
