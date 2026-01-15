import { useState } from "react";
import { View } from "react-native";
import { CalendarScreen } from "./calendar";

export default function BookingScreen() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <CalendarScreen
        onSelectDate={(date) => {
          setSelectedDate(date);
        }}
      />
    </View>
  );
}
