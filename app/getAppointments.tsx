import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { getAppointments } from "@/app/utils/appointments";

export type Appointment = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  service: string;
  status: string;
  client: {
    first_name: string;
    last_name: string;
    phone?: string;
  } | null;
};

export default function GetAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    getAppointments().then(setAppointments);
  }, []);

  return (
    <View style={styles.container}>
      {appointments.map((a) => (
        <View key={a.id}>
          <ThemedText>
            {a.client?.first_name} {a.client?.last_name}
          </ThemedText>
          <ThemedText>
            {a.appointment_date} — {a.appointment_time}
          </ThemedText>
        </View>
      ))}

      {appointments.length === 0 && (
        <ThemedText>Nessuna prenotazione</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
});
