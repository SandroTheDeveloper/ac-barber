import React from "react";
import { StyleSheet, Text, Pressable, Linking, Alert } from "react-native";
import { ButtonWhatsAppProps } from "./types";

const ButtonWhatsApp = ({
  phone,
  message,
  label,
  style,
}: ButtonWhatsAppProps) => {
  const openWhatsApp = async () => {
    const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(
      message
    )}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Errore", "WhatsApp non è installato.");
      }
    } catch (error) {
      console.error("Errore:", error);
    }
  };

  return (
    <Pressable style={styles.button} onPress={openWhatsApp}>
      <Text style={styles.text}>{label || "Invia Messaggio"}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#25D366",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  text: { color: "white", fontWeight: "bold" },
});

export default ButtonWhatsApp;
