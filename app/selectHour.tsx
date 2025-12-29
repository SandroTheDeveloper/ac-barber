import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

type SelectHourProps = {
  onSelect: (hour: string, service: string) => void;
  selected?: string;
};

export function SelectHour({ onSelect, selected }: SelectHourProps) {
  const [service, setService] = useState<'TAGLIO' | 'BARBA' | 'TAGLIO+BARBA' | null>(null);
  const [period, setPeriod] = useState<'MATTINO' | 'POMERIGGIO' | null>(null);
  const interval = 15;
  const CELL_SIZE = 70;

  // genera gli slot in base al periodo
  const generateSlots = (): string[] => {
    if (!period) return [];
    const hours: string[] = [];
    let startHour: number, endHour: number;

    if (period === 'MATTINO') {
      startHour = 9;
      endHour = 13;
    } else {
      startHour = 14;
      endHour = 19;
    }

    for (let h = startHour; h <= endHour; h++) {
      for (let m = 0; m < 60; m += interval) {
        if (period === 'MATTINO' && h === 13 && m > 45) continue;
        if (period === 'POMERIGGIO' && h === 19 && m > 0) continue;
        const hourString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        hours.push(hourString);
      }
    }
    return hours;
  };

  const slots = generateSlots();
  const slotsPerRow = 4;
  const rows: string[][] = [];
  for (let i = 0; i < slots.length; i += slotsPerRow) {
    rows.push(slots.slice(i, i + slotsPerRow));
  }

  return (
    <View style={styles.container}>
      {/* Step 1: Selezione Servizio */}
      {!service && (
        <View style={styles.typeContainer}>
          {['TAGLIO', 'BARBA', 'TAGLIO+BARBA'].map((s) => (
            <Pressable key={s} onPress={() => setService(s as any)} style={styles.periodButton}>
              <ThemedText style={styles.periodText}>{s}</ThemedText>
            </Pressable>
          ))}
        </View>
      )}

      {/* Step 2: Selezione Periodo */}
      {service && !period && (
        <><View style={styles.periodContainer}>
              <Pressable onPress={() => setService(null)} style={styles.backButton}>
                    <ThemedText>← Torna indietro</ThemedText>
                </Pressable>
                <View style={styles.row}>
                  <Pressable onPress={() => setPeriod('MATTINO')} style={styles.periodButton}>
                      <ThemedText style={styles.periodText}>MATTINO</ThemedText>
                  </Pressable>
                  <Pressable onPress={() => setPeriod('POMERIGGIO')} style={styles.periodButton}>
                      <ThemedText style={styles.periodText}>POMERIGGIO</ThemedText>
                  </Pressable>
                  </View>
            </View></>
      )}

      {/* Step 3: Selezione Orario */}
      {service && period && (
        <>
          <View style={styles.row}>
            <Pressable onPress={() => setPeriod(null)} style={styles.backButton}>
              <ThemedText>← Torna indietro</ThemedText>
            </Pressable>
          </View>

          {rows.map((row) => (
            <View key={row.join('-')} style={styles.row}>
              {row.map((hour) => {
                const isSelected = selected === hour;
                return (
                  <Pressable
                    key={hour}
                    onPress={() => onSelect(hour, service)}
                    style={[styles.hourButton, isSelected && styles.selectedButton]}
                  >
                    <ThemedText style={isSelected ? styles.selectedText : styles.hourText}>
                      {hour}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </>
      )}
    </View>
  );
}

const CELL_SIZE = 70;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    marginVertical: 12,
  },
  typeContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
    periodContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  periodButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#888',
  },
  periodText: {
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#888',
    marginBottom: 12,
  },
  hourButton: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#888',
  },
  hourText: {
    fontSize: 16,
  },
  selectedButton: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
});
