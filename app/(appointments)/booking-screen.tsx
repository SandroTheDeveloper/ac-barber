import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { CalendarPicker } from "@/components/ui/calendar/CalendarPicker";
import { useFocusEffect, useRouter } from "expo-router";
import { Period, Service } from "../features/appointments/types";
import { getFullDatesFromSupabase } from "../services/helper";

export default function BookingScreen() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [period, setPeriod] = useState<Period | null>(null);
  const [hour, setHour] = useState<string | null>(null);
  const router = useRouter();
  const [fullDates, setFullDates] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function fetchDates() {
        const dates = await getFullDatesFromSupabase();
        setFullDates(dates);
      }
      fetchDates();
    }, []),
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <CalendarPicker
        value={selectedDate}
        onSelectDate={(date) => {
          setSelectedDate(date);
          setService(null);
          setPeriod(null);
          setHour(null);
          router.push(`/appointment-flow?date=${encodeURIComponent(date)}`);
        }}
        disabledWeekDays={[0, 1]}
        showSelectedLabel
        fullDates={fullDates}
      />
    </View>
  );
}
