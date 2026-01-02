import { useState } from "react";
import { View, TextInput, Pressable, Text, StyleSheet } from "react-native";
import { supabase } from "./utils/supabase";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Inserisci email e password");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }

    // ✅ STOP QUI
    // Stack.Protected intercetterà la sessione
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accedi</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        onPress={handleLogin}
        style={[styles.button, loading && { opacity: 0.6 }]}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Accesso..." : "Login"}
        </Text>
      </Pressable>

      <Text
        style={styles.forgotPassword}
        onPress={() => router.replace("/reset-password")}
      >
        {"Password dimenticata?"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#888",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "blue",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  forgotPassword: {
    color: "black",
    marginTop: 10,
  },
});
