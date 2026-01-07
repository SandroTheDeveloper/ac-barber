import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { deleteAppointments, getAppointments } from "./utils/appointments";
import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { formatAppointmentDate } from "./utils/helper";
import { deleteClient } from "./utils/client";
import { supabase } from "./utils/supabase";

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

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const PAGE_SIZE = 10;

  // 🔹 Carica clienti dal DB
  const loadAppointments = async () => {
    const data = await getAppointments();
    setAppointments(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [])
  );

  // 🔹 Modifica cliente
  const handleEdit = (appointment: Appointment) => {
    router.push({
      pathname: "/edit-appointment",
      params: { id: appointment.id },
    });
  };

  // 🔹 Elimina cliente con conferma
  const handleDelete = (id: string, appointment: Appointment) => {
    const message = `Sei sicuro di voler l'appuntamento di ${appointment.client?.first_name} ${appointment.client?.last_name}?`;

    if (Platform.OS === "web") {
      const confirmed = window.confirm(message);
      if (!confirmed) return;
      deleteAndRefresh(id);
    } else {
      Alert.alert("Conferma eliminazione", message, [
        { text: "Annulla", style: "cancel" },
        {
          text: "Elimina",
          style: "destructive",
          onPress: async () => deleteAndRefresh(id),
        },
      ]);
    }
  };

  const deleteAndRefresh = async (id: string) => {
    await deleteAppointments(id);
    loadAppointments();
  };

  // 🔍 Filtra clienti
  const filteredAppointments = useMemo(() => {
    const q = search.toLowerCase();
    return appointments.filter(
      (c) =>
        c.client?.first_name.toLowerCase().includes(q) ||
        c.client?.last_name.toLowerCase().includes(q) ||
        (c.service?.toLowerCase().includes(q) ?? false) ||
        (c.appointment_date?.toLowerCase().includes(q) ?? false) ||
        (c.appointment_time?.toLowerCase().includes(q) ?? false)
    );
  }, [appointments, search]);

  // 🔹 Pagina corrente
  const paginatedClients = filteredAppointments.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  );

  const totalPages = Math.ceil(filteredAppointments.length / PAGE_SIZE);

  // 🔹 Render singolo appuntamento
  const renderItem = ({ item }: { item: Appointment }) => {
    const { weekday, day, hour } = formatAppointmentDate(
      item.appointment_date,
      item.appointment_time
    );

    return (
      <View style={styles.card}>
        <ThemedText type="defaultSemiBold" style={styles.name}>
          {item.client?.first_name} {item.client?.last_name}
        </ThemedText>

        {/* 📅 Giorno della settimana + data */}
        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={16} color="#555" />
          <ThemedText style={styles.meta}>
            {weekday.charAt(0).toUpperCase() + weekday.slice(1)} · {day}
          </ThemedText>
        </View>

        {/* ⏰ Ora senza secondi */}
        <View style={styles.row}>
          <Ionicons name="time-outline" size={16} color="#555" />
          <ThemedText style={styles.meta}>{hour}</ThemedText>
        </View>

        <View style={styles.row}>
          <Ionicons name="options-outline" size={16} color="#555" />
          <ThemedText style={styles.meta}>{item.service}</ThemedText>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => handleEdit(item)}
          >
            <ThemedText>Modifica</ThemedText>
          </Pressable>

          <Pressable
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDelete(item.id!, item)}
          >
            <ThemedText style={{ color: "red" }}>Elimina</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  };

  useEffect(() => {
    getAppointments().then(setAppointments);
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Torna indietro",
          headerBackTitle: "Indietro", // iOS
        }}
      />
      <View style={styles.container}>
        <ThemedText type="title">Lista Appuntamenti</ThemedText>
        {/* 🔍 Search */}
        <TextInput
          placeholder="Cerca per nome o cognome"
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            setCurrentPage(0);
          }}
          style={styles.search}
        />
        <FlatList
          data={paginatedClients}
          keyExtractor={(item) => item.id!}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <ThemedText style={{ marginTop: 20 }}>
              Nessun cliente trovato
            </ThemedText>
          }
        />

        {appointments.length === 0 && (
          <ThemedText>Nessuna prenotazione</ThemedText>
        )}

        {/* 🔹 Controlli paginazione */}
        {totalPages > 1 && (
          <View style={styles.pagination}>
            <Pressable
              disabled={currentPage === 0}
              onPress={() => setCurrentPage((p) => p - 1)}
              style={[styles.pageBtn, currentPage === 0 && { opacity: 0.5 }]}
            >
              <ThemedText>{"<"} Indietro</ThemedText>
            </Pressable>

            <ThemedText>
              Pagina {currentPage + 1} di {totalPages}
            </ThemedText>

            <Pressable
              disabled={currentPage + 1 >= totalPages}
              onPress={() => setCurrentPage((p) => p + 1)}
              style={[
                styles.pageBtn,
                currentPage + 1 >= totalPages && { opacity: 0.5 },
              ]}
            >
              <ThemedText>Avanti {">"}</ThemedText>
            </Pressable>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  search: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginVertical: 12,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  name: {
    fontSize: 16,
    marginBottom: 4,
  },

  meta: {
    fontSize: 14,
    opacity: 0.8,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 10,
  },

  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },

  editBtn: {
    borderColor: "#888",
  },

  deleteBtn: {
    borderColor: "red",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  pageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: "#555",
  },
});
