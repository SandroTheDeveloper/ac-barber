import { GestureResponderEvent } from "react-native";

export type ButtonGeneralProps = {
  onPress: ((event: GestureResponderEvent) => void) | null | undefined
  message: string
};

export type ButtonWhatsAppProps = {
  message: string
  style : string
  phone?: string;
  label: string
};