import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useRouter } from "expo-router";

export default function Managementcreen() {
  const router = useRouter();

  return (
    <View>
      <Pressable
        style={styles.button}
        onPress={() => router.push("/createAccount")}
      >
        <ThemedText>Aggiungi un cliente</ThemedText>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/getClients")}
      >
        <ThemedText>Gestisci clienti</ThemedText>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/getAppointments")}
      >
        <ThemedText>Vedi appuntamenti</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  button: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
});
