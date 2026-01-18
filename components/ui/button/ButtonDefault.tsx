import { Pressable } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { styles } from "./button.styles";
import { ButtonGeneralProps } from "./types";

export function ButtonDefault({ onPress, message }: ButtonGeneralProps) {
  return (
    <>
      <Pressable style={styles.buttonDefault} onPress={onPress}>
        <ThemedText>{message}</ThemedText>
      </Pressable>
    </>
  );
}
