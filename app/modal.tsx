import { useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";
import { useState } from "react";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SelectHour, Service, Period } from "./selectHour";

export default function ModalScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const selectedDate = date ? new Date(decodeURIComponent(date)) : null;

  const [service, setService] = useState<Service | null>(null);
  const [period, setPeriod] = useState<Period | null>(null);
  const [hour, setHour] = useState<string | null>(null);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Hai selezionato:</ThemedText>

      {selectedDate && (
        <ThemedText>📅 {selectedDate.toLocaleDateString("it-IT")}</ThemedText>
      )}

      {service && <ThemedText>✂️ {service}</ThemedText>}
      {period && <ThemedText>🌤️ {period}</ThemedText>}
      {hour && <ThemedText>⏰ {hour}</ThemedText>}

      <SelectHour
        service={service}
        period={period}
        selectedHour={hour ?? undefined}
        onSelectService={(s) => {
          setService(s);
          setPeriod(null);
          setHour(null);
        }}
        onSelectPeriod={(p) => {
          setPeriod(p);
          setHour(null);
        }}
        onSelectHour={setHour}
        onBackFromService={() => setService(null)}
        onBackFromPeriod={() => {
          setPeriod(null);
          setHour(null);
        }}
        onBackFromHour={() => setHour(null)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
