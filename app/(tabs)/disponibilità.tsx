import React from "react";
import BookingScreen from "../(appointments)/booking-screen";
import { View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Stack } from "expo-router";
import { styles } from "./styles";

export default function Disponibilità() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Disponibilità",
          headerBackTitle: "Indietro", // iOS
        }}
      />
      <ThemedText type="title">Seleziona il giorno</ThemedText>
      <BookingScreen />
    </View>
  );
}
