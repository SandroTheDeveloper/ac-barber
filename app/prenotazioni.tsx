import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Modal,
  FlatList,
  Platform,
  Alert,
} from "react-native";
import { router, Stack, useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { Calendar } from "react-native-calendars";
import { useEffect, useMemo, useState } from "react";
import { Appointment } from "./get-appointments";
import { formatAppointmentDate } from "./utils/helper";
import { supabase } from "./utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { deleteAppointments } from "./utils/appointments";

type DateFilter = "TODAY" | "DATE" | "PAST" | "ALL";

export default function Prenotazioni() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 10;

  const [dateFilter, setDateFilter] = useState<DateFilter>("ALL");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setClientId(data.user?.id ?? null);
    });
  }, []);

  // 🔹 Elimina cliente con conferma
  const handleDelete = (id: string, appointment: Appointment) => {
    const { day, hour } = formatAppointmentDate(
      appointment.appointment_date,
      appointment.appointment_time
    );
    const message = `Sei sicuro di voler eliminare l'appuntamento del ${day} delle ore ${hour}?`;

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
    const success = await deleteAppointments(id);
    if (success) {
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    }
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
            onPress={() => handleDelete(item.id!, item)}
            disabled={isPastAppointment}
          >
            <ThemedText style={{ color: "red" }}>Elimina</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  };

  const loadAppointments = async () => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    let query = supabase
      .from("appointments")
      .select(
        `
              id,
              appointment_date,
              appointment_time,
              service,
              status,
              clients (
                first_name,
                last_name,
                phone
              )
              `
      )
      .eq("client_id", clientId)
      .order("appointment_date", { ascending: true });

    setLoading(false);

    switch (dateFilter) {
      case "TODAY":
        query = query.eq("appointment_date", today);
        break;
      case "DATE":
        if (selectedDate) {
          query = query.eq("appointment_date", selectedDate);
        }
        break;
      case "PAST":
        query = query.lt("appointment_date", today);
        break;
      case "ALL":
      default:
        break;
    }

    const { data, error } = await query;

    if (error) return;

    setAppointments(
      data.map((a: any) => ({
        ...a,
        client: a.clients ?? null,
      }))
    );
  };

  useEffect(() => {
    loadAppointments();
  }, [clientId, dateFilter, selectedDate]);

  useEffect(() => {
    setCurrentPage(0);
  }, [search, dateFilter, selectedDate]);

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
          {...(loading && <ThemedText>Caricamento…</ThemedText>)}
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
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },

  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#888",
  },

  filterButtonActive: {
    backgroundColor: "green",
    borderColor: "green",
  },

  filterTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  calendarContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    width: "90%",
  },

  disabledBtn: {
    opacity: 0.5,
    backgroundColor: "#f5f5f5",
  },

  disabledText: {
    color: "#999",
  },
});
