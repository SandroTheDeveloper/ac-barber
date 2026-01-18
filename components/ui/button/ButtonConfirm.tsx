import { Pressable } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { styles } from "./button.styles";
import { ButtonGeneralProps } from "./types";

export function ButtonConfirm({ onPress, message }: ButtonGeneralProps) {
  return (
    <>
      <Pressable style={styles.buttonConfirm} onPress={onPress}>
        <ThemedText>{message}</ThemedText>
      </Pressable>
    </>
  );
}
