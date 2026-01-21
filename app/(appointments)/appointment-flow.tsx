import { useLocalSearchParams } from "expo-router";
import { Alert } from "react-native";
import { useEffect, useRef, useState } from "react";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SelectHour } from "./selectHour";
import { useRouter } from "expo-router";
import { supabase } from "../services/supabase";
import { getBookedHours } from "../features/appointments/api";
import { styles } from "./styles";
import { Period, Service } from "../features/appointments/types";
import { ButtonDefault } from "@/components/ui/button/ButtonDefault";

export default function AppointmentFlow({}) {
  const { date } = useLocalSearchParams<{ date: string }>();
  const selectedDate = date ? new Date(decodeURIComponent(date)) : null;

  const [service, setService] = useState<Service | null>(null);
  const [period, setPeriod] = useState<Period | null>(null);
  const [hour, setHour] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const router = useRouter();
  const selectHourRef = useRef<{ onBackFromPeriod: () => void }>(null);
  const [bookedHours, setBookedHours] = useState<string[]>([]);

  // converte date in YYYY-MM-DD
  const toDateOnly = (date: Date) => date.toISOString().split("T")[0];

  useEffect(() => {
    if (!selectedDate) return;

    getBookedHours(toDateOnly(selectedDate)).then(setBookedHours);
  }, [selectedDate]);

  const handleConfirm = async () => {
    if (!selectedDate || !service || !period || !hour) {
      Alert.alert("Errore", "Seleziona giorno, servizio, periodo e ora");
      return;
    }

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        Alert.alert("Errore", "Impossibile identificare l'utente");
        return;
      }

      const { data, error } = await supabase.from("appointments").insert([
        {
          client_id: user.id,
          appointment_date: toDateOnly(selectedDate),
          appointment_time: hour,
          service,
          period,
          status: "CONFIRMED",
        },
      ]);

      if (error) throw error;

      setConfirmed(true);
    } catch (err) {
      console.error("Errore salvataggio prenotazione:", err);
      Alert.alert("Errore", "Impossibile salvare la prenotazione");
    }
  };

  //STEP FINALE DI CONFERMA
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

        <ButtonDefault
          onPress={() => router.replace("/(tabs)/mio-profilo")}
          message=">Le mie prenotazioni"
        ></ButtonDefault>
      </ThemedView>
    );
  }

  //RECAP APPOINTMENT
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
        bookedHours={bookedHours}
        day={""}
        ref={selectHourRef}
        service={service}
        period={period}
        selectedHour={hour ?? undefined}
        handleConfirm={handleConfirm}
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
