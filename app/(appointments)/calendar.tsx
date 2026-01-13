import { useMemo, useState } from "react";
import { View } from "react-native";
import { Calendar as RNCalendar } from "react-native-calendars";
import { ThemedText } from "@/components/themed-text";
import { useRouter } from "expo-router";
import { styles } from "./styles";

type CalendarProps = {
  onSelectDate: (date: string) => void;
};

export function Calendar({ onSelectDate }: CalendarProps) {
  const router = useRouter();

  /* =======================
     DATE LIMITS
     ======================= */
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const minDate = today.toISOString().split("T")[0];

  const maxDateObj = new Date(today.getFullYear(), today.getMonth() + 12, 0);
  const maxDate = maxDateObj.toISOString().split("T")[0];

  /* =======================
     STATE
     ======================= */
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [visibleMonth, setVisibleMonth] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });

  /* =======================
     ARROW LOGIC
     ======================= */
  const disableLeftArrow =
    visibleMonth.year === today.getFullYear() &&
    visibleMonth.month === today.getMonth();

  const disableRightArrow =
    visibleMonth.year === maxDateObj.getFullYear() &&
    visibleMonth.month === maxDateObj.getMonth();

  /* =======================
     DISABLED DAYS
     ======================= */
  const disabledDates = useMemo(() => {
    const disabled: Record<string, any> = {};

    const start = new Date(today);
    const end = new Date(maxDateObj);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay(); // 1 dom, 2 lun
      if (dayOfWeek === 1 || dayOfWeek === 2) {
        const key = d.toISOString().split("T")[0];
        disabled[key] = { disabled: true, disableTouchEvent: true };
      }
    }

    return disabled;
  }, [today, maxDateObj]);

  /* =======================
     MARKED DATES
     ======================= */
  const markedDates = {
    ...disabledDates,
    ...(selectedDate && {
      [selectedDate]: {
        selected: true,
        selectedColor: "green",
      },
    }),
  };

  /* =======================
     RENDER
     ======================= */
  return (
    <View style={styles.calendarContainer}>
      <RNCalendar
        firstDay={1}
        minDate={minDate}
        maxDate={maxDate}
        hideExtraDays
        enableSwipeMonths={false}
        disableArrowLeft={disableLeftArrow}
        disableArrowRight={disableRightArrow}
        markedDates={markedDates}
        onMonthChange={(m) =>
          setVisibleMonth({ month: m.month - 1, year: m.year })
        }
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          onSelectDate(day.dateString);
          router.push(
            `/booking-flow?date=${encodeURIComponent(day.dateString)}`
          );
        }}
        theme={{
          todayTextColor: "green",
          arrowColor: "green",
          selectedDayBackgroundColor: "green",
          selectedDayTextColor: "#fff",
        }}
      />

      {selectedDate && (
        <ThemedText style={styles.selectedInfo}>
          Data selezionata: {new Date(selectedDate).toLocaleDateString("it-IT")}
        </ThemedText>
      )}
    </View>
  );
}
