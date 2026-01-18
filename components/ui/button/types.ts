import { GestureResponderEvent } from "react-native";

export type ButtonGeneralProps = {
  onPress: ((event: GestureResponderEvent) => void) | null | undefined
  message: string
};