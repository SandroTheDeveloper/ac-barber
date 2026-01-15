import React, { useState } from "react";
import { View } from "react-native";
import { Period, Service } from "./selectHour";
import { CalendarPicker } from "@/components/ui/calendar/CalendarPicker";

export default function BookingScreen() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [period, setPeriod] = useState<Period | null>(null);
  const [hour, setHour] = useState<string | null>(null);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <CalendarPicker
        value={selectedDate}
        onSelectDate={(date) => {
          setSelectedDate(date);
          setService(null);
          setPeriod(null);
          setHour(null);
        }}
        disabledWeekDays={[0, 1]}
        showSelectedLabel
      />
    </View>
  );
}
