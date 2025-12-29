import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SelectHour } from './selectHour';
import { useState } from 'react';

export default function ModalScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();

  const selected = date
    ? new Date(decodeURIComponent(date))
    : null;
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Hai selezionato:</ThemedText>
      {selected ? (
        <ThemedText>
          {selected.toLocaleDateString('it-IT')}
        </ThemedText>
      ) : (
        <ThemedText>Nessuna data</ThemedText>
      )}
      <SelectHour selected={selectedHour || undefined} onSelect={setSelectedHour} />
      {selectedHour && (
        <ThemedText style={{ marginTop: 10 }}>
          Orario selezionato: {selectedHour}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
