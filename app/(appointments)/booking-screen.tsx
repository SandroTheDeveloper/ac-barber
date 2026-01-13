import { useState, useRef } from "react";
import { View, Alert, Pressable } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { SelectHour, Service, Period } from "./selectHour";
import { Calendar } from "./calendar";

export default function BookingScreen() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [period, setPeriod] = useState<Period | null>(null);
  const [hour, setHour] = useState<string | null>(null);

  const selectHourRef = useRef<{ onBackFromPeriod: () => void }>(null);

  // mock orari già prenotati (da fetch dal backend in base alla data)
  const bookedHours = ["09:00", "09:15", "14:30"];

  const handleConfirm = () => {
    if (!selectedDate || !service || !period || !hour) {
      Alert.alert("Errore", "Seleziona giorno, servizio, periodo e ora");
      return;
    }

    Alert.alert(
      "Prenotazione confermata",
      `${service} il ${new Date(selectedDate).toLocaleDateString(
        "it-IT"
      )} alle ${hour} (${period})`
    );

    // resetta flusso
    setSelectedDate(null);
    setService(null);
    setPeriod(null);
    setHour(null);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Calendario */}
      {!selectedDate ? (
        <Calendar
          onSelectDate={(date) => {
            setSelectedDate(date);
            setService(null);
            setPeriod(null);
            setHour(null);
          }}
        />
      ) : (
        <>
          {/* Selezione servizio / periodo / ora */}
          <SelectHour
            bookedHours={bookedHours}
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
            onSelectHour={(h) => setHour(h)}
            onBackFromService={() => setService(null)}
            onBackFromPeriod={() => {
              setPeriod(null);
              setHour(null);
            }}
            onBackFromHour={() => setHour(null)}
          />

          {/* Pulsante conferma */}
          {hour && (
            <Pressable
              onPress={() => console.log("Clic pulsante!")}
              style={{
                marginTop: 20,
                padding: 12,
                backgroundColor: "green",
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <ThemedText style={{ color: "#fff" }}>
                Conferma prenotazione
              </ThemedText>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}
