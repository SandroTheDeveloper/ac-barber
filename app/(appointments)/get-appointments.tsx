import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { formatAppointmentDate } from "../services/helper";
import { Appointment } from "../features/appointments/types";
import {
  DateFilter,
  useAppointments,
} from "../features/appointments/hooks/useAppointments";
import { styles } from "./styles";

export default function AppointmentsScreen() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const [dateFilter, setDateFilter] = useState<DateFilter>("TODAY");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { appointments, loading, remove } = useAppointments(
    dateFilter,
    selectedDate
  );

  const PAGE_SIZE = 10;
  // 🔹 Modifica cliente
  const handleEdit = (appointment: Appointment) => {
    router.push({
      pathname: "/edit-appointment",
      params: { id: appointment.id },
    });
  };

  // 🔹 Elimina cliente con conferma
  const handleDelete = (id: string, appointment: Appointment) => {
    const { day, hour } = formatAppointmentDate(
      appointment.appointment_date,
      appointment.appointment_time
    );
    const message = `Sei sicuro di voler eliminare l'appuntamento di ${appointment.client?.first_name} ${appointment.client?.last_name} del ${day} delle ore ${hour}?`;

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
    await remove(id);
  };

  // 🔍 Filtra clienti
  const filteredAppointments = useMemo(() => {
    const q = search.toLowerCase();
    return appointments.filter(
      (c) =>
        c.client?.first_name.toLowerCase().includes(q) ||
        c.client?.last_name.toLowerCase().includes(q) ||
        (c.service?.toLowerCase().includes(q) ?? false)
    );
  }, [appointments, search]);

  // 🔹 Pagina corrente
  const paginatedAppointments = filteredAppointments.slice(
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

    const today = new Date().toISOString().split("T")[0];
    const isPastAppointment = item.appointment_date < today;

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
            style={[
              styles.actionBtn,
              styles.editBtn,
              isPastAppointment && styles.disabledBtn,
            ]}
            onPress={() => handleEdit(item)}
            disabled={isPastAppointment}
          >
            <ThemedText>Modifica</ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.actionBtn,
              styles.editBtn,
              isPastAppointment && styles.disabledBtn,
            ]}
            onPress={() => handleDelete(item.id!, item)}
            disabled={isPastAppointment}
          >
            <ThemedText style={{ color: "red" }}>Elimina</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  };

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
          placeholder="Cerca per nome, cognome o tipo di servizio"
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            setCurrentPage(0);
          }}
          style={styles.search}
        />
        <View style={styles.filterRow}>
          {[
            { label: "TUTTI", value: "ALL" },
            { label: "OGGI", value: "TODAY" },
            { label: "SELEZIONA DATA", value: "DATE" },
            { label: "PASSATI", value: "PAST" },
          ].map((f) => (
            <Pressable
              key={f.value}
              onPress={() => {
                setDateFilter(f.value as DateFilter);
                if (f.value !== "DATE") setSelectedDate(null);
                if (f.value === "DATE") setCalendarOpen(true);
              }}
              style={[
                styles.filterButton,
                dateFilter === f.value && styles.filterButtonActive,
              ]}
            >
              <ThemedText
                style={dateFilter === f.value && styles.filterTextActive}
              >
                {f.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
        <Modal
          visible={calendarOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setCalendarOpen(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setCalendarOpen(false)}
          >
            <View style={styles.calendarContainer}>
              <Calendar
                onDayPress={(day) => {
                  setSelectedDate(day.dateString);
                  setCalendarOpen(false);
                }}
                markedDates={
                  selectedDate ? { [selectedDate]: { selected: true } } : {}
                }
                firstDay={1}
              />
            </View>
          </Pressable>
        </Modal>
        <FlatList
          data={paginatedAppointments}
          keyExtractor={(item) => item.id!}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <ThemedText style={{ marginTop: 20 }}>
              Non ci sono prenotazioni
            </ThemedText>
          }
        />

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
