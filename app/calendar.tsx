import { ThemedText } from '@/components/themed-text';
import { StyleSheet, View } from 'react-native';

const giorni = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

export function CalendarMonth({
  month,
  year,
}: {
  month: number;
  year: number;
}) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;

  const cells = Array(startOffset).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  return (
    <View style={calendarStyles.container}>
      <ThemedText style={calendarStyles.monthTitle}>
        {firstDay.toLocaleDateString('it-IT', {
          month: 'long',
          year: 'numeric',
        })}
      </ThemedText>

      <View style={calendarStyles.grid}>
        {giorni.map((g) => (
          <ThemedText key={g} style={calendarStyles.dayHeader}>
            {g}
          </ThemedText>
        ))}

        {cells.map((day, index) => (
          <View key={index} style={calendarStyles.cell}>
            {day && <ThemedText>{day}</ThemedText>}
          </View>
        ))}
      </View>
    </View>
  );
}

const calendarStyles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayHeader: {
    width: '14.28%',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 6,
  },
  cell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
