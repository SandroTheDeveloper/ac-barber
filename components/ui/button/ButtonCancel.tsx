import { Pressable } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { styles } from "./button.styles";
import { router } from "expo-router";

export function ButtonCancel() {
  return (
    <>
      <Pressable style={styles.buttonCancel} onPress={router.back}>
        <ThemedText>Annulla</ThemedText>
      </Pressable>
    </>
  );
}
