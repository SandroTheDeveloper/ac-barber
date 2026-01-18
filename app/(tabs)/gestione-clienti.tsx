import React from "react";
import { View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ButtonDefault } from "@/components/ui/button/ButtonDefault";

export default function GestioneClienti() {
  const router = useRouter();

  return (
    <View>
      <Stack.Screen
        options={{
          title: "Gestione clienti",
          headerBackTitle: "Indietro", // iOS
        }}
      />
      <ButtonDefault
        onPress={() => router.push("/(clients)/create-client")}
        message="Aggiungi un cliente"
      ></ButtonDefault>

      <ButtonDefault
        onPress={() => router.push("/get-clients")}
        message="Gestisci clienti"
      ></ButtonDefault>

      <ButtonDefault
        onPress={() => router.push("/get-appointments")}
        message="Vedi appuntamenti"
      ></ButtonDefault>

      <ButtonDefault
        onPress={() => router.push("/create-appointment")}
        message="Aggiungi appuntamento"
      ></ButtonDefault>
    </View>
  );
}
