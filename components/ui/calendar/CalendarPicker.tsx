import { useMemo, useState } from "react";
import { View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Calendar } from "react-native-calendars";
import { styles } from "./calendar.styles";
import { CalendarPickerProps } from "./types";

export function CalendarPicker({
  value,
  onSelectDate,
  minDate,
  maxDate,
  disabledWeekDays = [],
  showSelectedLabel = false,
}: CalendarPickerProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [visibleMonth, setVisibleMonth] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });

  const toLocaleDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };
  //DATE LIMITS
  const min = minDate ?? today.toISOString().split("T")[0];
  const maxDateObj = new Date(today.getFullYear(), today.getMonth() + 12, 0);
  const max = maxDate ?? maxDateObj.toISOString().split("T")[0];

  //STATE
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  //ARROW LOGIC
  const disableLeftArrow =
    visibleMonth.year === today.getFullYear() &&
    visibleMonth.month === today.getMonth();

  const disableRightArrow =
    visibleMonth.year === maxDateObj.getFullYear() &&
    visibleMonth.month === maxDateObj.getMonth();

  //DISABLED DAYS
  const disabledDates = useMemo(() => {
    if (!disabledWeekDays.length) return {};

    const disabled: Record<string, any> = {};
    const start = new Date(min);
    const end = new Date(max);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (disabledWeekDays.includes(d.getDay())) {
        const key = toLocaleDateString(d);
        disabled[key] = { disabled: true, disableTouchEvent: true };
      }
    }

    return disabled;
  }, [min, max, disabledWeekDays]);

  //MARKED DATES
  const markedDates = {
    ...disabledDates,
    ...(value && {
      [value]: {
        selected: true,
        selectedColor: "green",
      },
    }),
  };

  //RENDER
  return (
    <View style={styles.container}>
      <Calendar
        firstDay={1}
        minDate={min}
        maxDate={max}
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
        }}
        theme={{
          todayTextColor: "green",
          arrowColor: "green",
          selectedDayBackgroundColor: "green",
          selectedDayTextColor: "#fff",
        }}
      />

      {showSelectedLabel && value && (
        <ThemedText style={styles.selectedInfo}>
          Data selezionata: {new Date(value).toLocaleDateString("it-IT")}
        </ThemedText>
      )}
    </View>
  );
}
