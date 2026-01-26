import { useMemo, useState } from "react";
import { View } from "react-native";
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
  fullDates = [],
}: CalendarPickerProps) {
  const today = useMemo(() => new Date(), []);

  const toLocaleDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // DATE LIMITS
  const todayStr = useMemo(() => toLocaleDateString(today), [today]);

  const min = useMemo(() => {
    return minDate && minDate > todayStr ? minDate : todayStr;
  }, [minDate, todayStr]);

  const maxDateObj = useMemo(() => {
    return new Date(today.getFullYear(), today.getMonth() + 12, 0);
  }, [today]);

  const max = maxDate ?? toLocaleDateString(maxDateObj);

  const [visibleMonth, setVisibleMonth] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });

  // STATE
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // ARROW LOGIC
  const disableLeftArrow =
    visibleMonth.year === today.getFullYear() &&
    visibleMonth.month === today.getMonth();

  const disableRightArrow =
    visibleMonth.year === maxDateObj.getFullYear() &&
    visibleMonth.month === maxDateObj.getMonth();

  // DISABLED DAYS (Lunedì/Domenica)
  const disabledDates = useMemo(() => {
    if (!disabledWeekDays.length) return {};

    const disabled: Record<string, any> = {};
    const start = new Date(min);
    const end = new Date(max);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (disabledWeekDays.includes(d.getDay())) {
        const key = toLocaleDateString(d);
        disabled[key] = {
          disableTouchEvent: true,
          customStyles: {
            text: { color: "#d9e1e8" },
          },
        };
      }
    }

    return disabled;
  }, [min, max, disabledWeekDays]);

  // MARKED DATES
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = { ...disabledDates };

    // 1. DATE PIENE (Rosse)
    fullDates.forEach((date) => {
      marks[date] = {
        disableTouchEvent: true,
        customStyles: {
          text: {
            color: "red",
            fontWeight: "bold",
          },
        },
      };
    });

    // 2. DATA SELEZIONATA (Verde)
    if (value) {
      marks[value] = {
        selected: true,
        customStyles: {
          container: {
            backgroundColor: "green",
            borderRadius: 8,
          },
          text: {
            color: "white",
            fontWeight: "bold",
          },
        },
      };
    }

    return marks;
  }, [disabledDates, fullDates, value]);
  console.log("DATE PIENE RICEVUTE DAL DB:", fullDates);
  // RENDER
  return (
    <View style={styles.container}>
      <Calendar
        markingType={"custom"}
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
          // Blocco extra di sicurezza: se è pieno o disabilitato, ignora il click
          if (fullDates.includes(day.dateString)) return;

          setSelectedDate(day.dateString);
          onSelectDate(day.dateString);
        }}
        theme={{
          todayTextColor: "green",
          arrowColor: "green",
          // Rimuovi proprietà che vanno in conflitto con customStyles
        }}
      />
    </View>
  );
}
