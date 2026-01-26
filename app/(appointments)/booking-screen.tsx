import React, { useState, useCallback } from "react";
import { View } from "react-native";
import { CalendarPicker } from "@/components/ui/calendar/CalendarPicker";
import { useFocusEffect, useRouter } from "expo-router";
import { Period, Service } from "../features/appointments/types";
import { useFullDates } from "../features/appointments/hooks/useFullDates";

export default function BookingScreen() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [period, setPeriod] = useState<Period | null>(null);
  const [hour, setHour] = useState<string | null>(null);

  const router = useRouter();

  const { fullDates, refreshFullDates } = useFullDates();

  // Ricarica le date ogni volta che l'utente torna su questa pagina
  useFocusEffect(
    useCallback(() => {
      refreshFullDates();
    }, [refreshFullDates]),
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <CalendarPicker
        value={selectedDate}
        fullDates={fullDates}
        onSelectDate={(date) => {
          setSelectedDate(date);
          setService(null);
          setPeriod(null);
          setHour(null);
          router.push(`/appointment-flow?date=${encodeURIComponent(date)}`);
        }}
        disabledWeekDays={[0, 1]}
        showSelectedLabel
      />
    </View>
  );
}
