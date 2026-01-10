import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useRouter } from "expo-router";

export default function Managementcreen() {
  const router = useRouter();

  return (
    <View>
      <Pressable
        style={styles.card}
        onPress={() => router.push("/create-account")}
      >
        <ThemedText type="defaultSemiBold" style={styles.name}>
          Aggiungi un cliente
        </ThemedText>
      </Pressable>

      <Pressable
        style={styles.card}
        onPress={() => router.push("/get-clients")}
      >
        <ThemedText type="defaultSemiBold" style={styles.name}>
          Gestisci clienti
        </ThemedText>
      </Pressable>

      <Pressable
        style={styles.card}
        onPress={() => router.push("/get-appointments")}
      >
        <ThemedText type="defaultSemiBold" style={styles.name}>
          Vedi appuntamenti
        </ThemedText>
      </Pressable>

      <Pressable
        style={styles.card}
        onPress={() => router.push("/create-appointment")}
      >
        <ThemedText type="defaultSemiBold" style={styles.name}>
          Aggiungi appuntamento
        </ThemedText>
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    width: 300,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
  name: {
    fontSize: 16,
    marginBottom: 4,
  },
});
