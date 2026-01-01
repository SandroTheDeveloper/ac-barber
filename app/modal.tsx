import { useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useRef, useState } from "react";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SelectHour, Service, Period } from "./selectHour";
import { useRouter } from "expo-router";
import { supabase } from "@/app/utils/supabase";

type ModalScreenProps = {
  onBackFromPeriod: () => void;
};

export default function ModalScreen({ onBackFromPeriod }: ModalScreenProps) {
  const { date } = useLocalSearchParams<{ date: string }>();
  const selectedDate = date ? new Date(decodeURIComponent(date)) : null;

  const [service, setService] = useState<Service | null>(null);
  const [period, setPeriod] = useState<Period | null>(null);
  const [hour, setHour] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const router = useRouter();

  const selectHourRef = useRef<{ onBackFromPeriod: () => void }>(null);

  /* =======================
     STEP FINALE DI CONFERMA
     ======================= */
  if (confirmed) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">✅ Prenotazione confermata</ThemedText>

        {selectedDate && (
          <ThemedText style={styles.summary}>
            📅 {selectedDate.toLocaleDateString("it-IT")}
          </ThemedText>
        )}

        <ThemedText style={styles.summary}>✂️ {service}</ThemedText>
        <ThemedText style={styles.summary}>🌤️ {period}</ThemedText>
        <ThemedText style={styles.summary}>⏰ {hour}</ThemedText>

        <Pressable
          style={styles.button}
          onPress={() => router.replace("/(tabs)/profilo")}
        >
          <ThemedText>Le mie prenotazioni</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  /* =======================
     FLOW NORMALE
     ======================= */
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Hai selezionato:</ThemedText>

      {selectedDate && (
        <ThemedText>📅 {selectedDate.toLocaleDateString("it-IT")}</ThemedText>
      )}

      {service && <ThemedText>✂️ {service}</ThemedText>}
      {period && <ThemedText>🌤️ {period}</ThemedText>}
      {hour && <ThemedText>⏰ {hour}</ThemedText>}

      {service && period && hour && (
        <>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
            <Pressable style={styles.button} onPress={() => setConfirmed(true)}>
              <ThemedText>Conferma prenotazione</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => selectHourRef.current?.onBackFromPeriod()}
              style={styles.button}
            >
              <ThemedText>← Indietro</ThemedText>
            </Pressable>
          </View>
        </>
      )}

      <SelectHour
        ref={selectHourRef}
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
  button: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 12,
    width: 220,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    marginTop: 24,
    opacity: 0.7,
  },
  summary: {
    marginTop: 8,
    fontSize: 16,
  },
});
