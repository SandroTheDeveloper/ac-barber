import { useState } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";

const giorni = ["L", "M", "M", "G", "V", "S", "D"];

export function BookingCalendar() {
  const router = useRouter();
  const TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);

  // mese minimo = mese reale corrente
  const MIN_DATE = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);

  // calendario parte da data corrente
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;

  const cells = Array(startOffset)
    .fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  function prevMonth() {
    const prev = new Date(year, month - 1, 1);
    if (prev < MIN_DATE) return;
    setCurrentDate(prev);
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  const isPrevDisabled =
    year === MIN_DATE.getFullYear() && month === MIN_DATE.getMonth();

  function isDisabled(day: number) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay(); // 0 dom, 1 lun

    // domenica o lunedì
    if (dayOfWeek === 0 || dayOfWeek === 1) return true;

    // date passate
    if (date < TODAY) return true;

    return false;
  }

  function selectDay(day: number) {
    if (isDisabled(day)) return;

    const date = new Date(year, month, day);
    const iso = date.toISOString();
    setSelectedDate(iso);

    // apri la modale passando la data come query param
    router.push(`/modal?date=${encodeURIComponent(iso)}`);
  }

  return (
    <View style={styles.container}>
      {/* Header mese */}
      <View style={styles.header}>
        <Pressable
          onPress={prevMonth}
          disabled={isPrevDisabled}
          style={[styles.arrow, { opacity: isPrevDisabled ? 0.4 : 1 }]}
        >
          <IconSymbol name="chevron.right" size={24} color="#888" />
        </Pressable>
        <ThemedText style={styles.monthTitle}>
          {firstDay.toLocaleDateString("it-IT", {
            month: "long",
            year: "numeric",
          })}
        </ThemedText>

        <Pressable style={styles.arrow} onPress={nextMonth}>
          <IconSymbol name="chevron.right" size={24} color="#888" />
        </Pressable>
      </View>

      {/* Griglia */}
      <View style={styles.grid}>
        {giorni.map((g) => (
          <ThemedText key={g} style={styles.dayHeader}>
            {g}
          </ThemedText>
        ))}

        {cells.map((day, index) => {
          if (!day) return <View key={index} style={styles.cell} />;

          const disabled = isDisabled(day);
          const iso = new Date(year, month, day).toISOString();
          const selected = selectedDate === iso;

          return (
            <Pressable
              key={index}
              onPress={() => selectDay(day)}
              disabled={disabled}
              style={[
                styles.cell,
                disabled && styles.disabledCell,
                selected && styles.selectedCell,
              ]}
            >
              <ThemedText
                style={[
                  styles.dayText,
                  disabled && styles.disabledText,
                  selected && styles.selectedText,
                ]}
              >
                {day}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {selectedDate && (
        <ThemedText style={styles.selectedInfo}>
          Data selezionata: {new Date(selectedDate).toLocaleDateString("it-IT")}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayHeader: {
    width: "14.28%",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 6,
  },
  arrow: {
    width: 40,
    alignItems: "center",
  },
  cell: {
    width: "14.28%",
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  dayText: {
    fontSize: 16,
  },
  disabledCell: {
    opacity: 0.3,
  },
  disabledText: {
    textDecorationLine: "line-through",
  },
  selectedCell: {
    backgroundColor: "#000",
  },
  selectedText: {
    color: "#fff",
    fontWeight: "600",
  },
  selectedInfo: {
    marginTop: 12,
    fontSize: 14,
  },
});
