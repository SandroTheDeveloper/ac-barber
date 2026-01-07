import { StyleSheet } from "react-native";

import React from "react";
import BookingScreen from "../booking-screen";

export default function TabTwoScreen() {
  return <BookingScreen />;
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
