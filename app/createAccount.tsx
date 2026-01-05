import { useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { supabase } from "./utils/supabase";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { useUserRole } from "@/hooks/use-role-user";

export default function CreateAccount() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { role, loading } = useUserRole();
  const DEFAULT_PASSWORD = "esplosionecapelli26";
  const finalPassword = role === "ADMIN" ? DEFAULT_PASSWORD : password;

  const validateFields = () => {
    const requiredFields: { value: string; message: string }[] = [
      { value: firstName, message: "Nome obbligatorio" },
      { value: lastName, message: "Cognome obbligatorio" },
      { value: email, message: "Email obbligatoria" },
      { value: phone, message: "Telefono obbligatorio" },
    ];

    // Password solo se non è admin
    if (role !== "ADMIN") {
      requiredFields.push({
        value: password,
        message: "Password obbligatoria",
      });
    }

    for (const field of requiredFields) {
      if (!field.value.trim()) {
        Alert.alert(field.message);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    try {
      // 1️⃣ CREA L’UTENTE AUTH
      const { data, error } = await supabase.auth.signUp({
        email,
        password: finalPassword,
      });

      if (error) {
        Alert.alert("Errore", error.message);
        return;
      }

      // 2️⃣ CREA IL PROFILO CLIENT
      await supabase.from("clients").insert({
        id: data.user!.id,
        first_name: firstName,
        last_name: lastName,
        phone,
        email,
        role: "CLIENT",
      });

      const title =
        role === "ADMIN"
          ? "Link inviato al cliente"
          : "Link inviata alla tua email!";
      const message =
        role === "ADMIN"
          ? "Il cliente deve completare la registrazione"
          : "Controlla la tua email per completare la registrazione";

      if (Platform.OS === "web") {
        window.alert(`${title}\n\n${message}`);
      } else {
        Alert.alert(title, message);
      }

      router.replace("/login");
    } catch (err) {
      Alert.alert("Errore", "Qualcosa è andato storto");
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nome"
        value={firstName}
        onChangeText={setFirstName}
        style={styles.input}
      />
      <TextInput
        placeholder="Cognome"
        value={lastName}
        onChangeText={setLastName}
        style={styles.input}
      />
      <TextInput
        placeholder="Telefono"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />
      {role !== "ADMIN" && (
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
      )}

      <Pressable style={styles.button} onPress={handleSubmit}>
        <ThemedText>{role === "ADMIN" ? "Aggiungi" : "Registrati"}</ThemedText>
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
  },
});
