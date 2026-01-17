import React from "react";
import { View, Pressable } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useRouter } from "expo-router";
import { styles } from "./styles";

export default function GestioneClienti() {
  const router = useRouter();

  return (
    <View>
      <Pressable
        style={styles.card}
        onPress={() => router.push("/(clients)/create-client")}
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
