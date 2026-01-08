import { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar } from "react-native-calendars";
import { supabase } from "@/app/utils/supabase";
import { ThemedText } from "@/components/themed-text";
import { getBlockedSlots, getServices } from "./utils/helper";

type Client = {
  id: string;
  first_name: string;
  last_name: string;
};

type Service = "TAGLIO" | "BARBA" | "TAGLIO+BARBA";
type Period = "MATTINO" | "POMERIGGIO";

type AppointmentData = {
  appointment_date: string;
  appointment_time: string;
  service: string;
  client_id: string;
  clients: Client;
};

export default function EditAppointment() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Client state
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientLabel, setClientLabel] = useState("");
  const [clientQuery, setClientQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [dropdownClientOpen, setDropdownClientOpen] = useState(false);

  // Service state
  const [service, setService] = useState<Service | null>(null);
  const [dropdownServiceOpen, setDropdownServiceOpen] = useState(false);

  // Date state
  const [day, setDay] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Hour state
  const [hour, setHour] = useState("");
  const [period, setPeriod] = useState<Period | null>(null);
  const [dropdownPeriodOpen, setDropdownPeriodOpen] = useState(false);
  const [dropdownHourOpen, setDropdownHourOpen] = useState(false);
  const [bookedHours, setBookedHours] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [originalAppointmentTime, setOriginalAppointmentTime] = useState("");

  const blockedSlots = service ? getBlockedSlots(bookedHours, service) : [];
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const maxMonthDate = new Date(currentYear, currentMonth + 12, 1);

  const [visibleMonth, setVisibleMonth] = useState({
    month: currentMonth,
    year: currentYear,
  });

  const disableArrowLeft =
    visibleMonth.year < currentYear ||
    (visibleMonth.year === currentYear && visibleMonth.month <= currentMonth);

  const disableArrowRight =
    visibleMonth.year > maxMonthDate.getFullYear() ||
    (visibleMonth.year === maxMonthDate.getFullYear() &&
      visibleMonth.month >= maxMonthDate.getMonth());

  const minDate = new Date(currentYear, currentMonth, 1)
    .toISOString()
    .split("T")[0];

  const maxDate = new Date(currentYear, currentMonth + 12, 31)
    .toISOString()
    .split("T")[0];

  /* =======================
     LOAD APPOINTMENT
     ======================= */
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
          appointment_date,
          appointment_time,
          service,
          client_id,
          clients (
            id,
            first_name,
            last_name
          )
        `
        )
        .eq("id", id)
        .single();

      const appointmentData = data as AppointmentData | null;

      if (error || !appointmentData) {
        Alert.alert("Errore", "Appuntamento non trovato");
        router.back();
        return;
      }

      const client = appointmentData.clients;

      setDay(appointmentData.appointment_date);
      setHour(appointmentData.appointment_time);
      setOriginalAppointmentTime(appointmentData.appointment_time);
      setService(appointmentData.service as Service);
      setClientId(appointmentData.client_id);

      // Determina il periodo in base all'orario
      const hourNum = parseInt(appointmentData.appointment_time.split(":")[0]);
      setPeriod(hourNum < 14 ? "MATTINO" : "POMERIGGIO");

      if (client) {
        const clientLabel = `${client.first_name} ${client.last_name}`;
        setClientLabel(clientLabel);
        setClientQuery(clientLabel);
      }
      setLoading(false);
    };

    load();
  }, [id]);

  /* =======================
     LOAD CLIENTS
     ======================= */
  useEffect(() => {
    const loadClients = async () => {
      const { data } = await supabase
        .from("clients")
        .select("id, first_name, last_name")
        .order("last_name");

      if (data) setClients(data);
    };

    loadClients();
  }, []);

  /* =======================
     LOAD BOOKED HOURS
     ======================= */
  useEffect(() => {
    if (!day) return;

    const loadBookedHours = async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("appointment_time, id")
        .eq("appointment_date", day)
        .eq("status", "CONFIRMED");

      if (!error && data) {
        // Escludi l'orario dell'appuntamento corrente
        const hours = data
          .filter((a) => a.id !== id)
          .map((a) => a.appointment_time);
        setBookedHours(hours);
      }
    };

    loadBookedHours();
  }, [day, id]);

  /* =======================
     GENERATE HOUR SLOTS
     ======================= */
  const generateSlots = (): string[] => {
    if (!period) return [];

    const hours: string[] = [];
    const startHour = period === "MATTINO" ? 9 : 14;
    const endHour = period === "MATTINO" ? 13 : 19;
    const interval = 15;

    for (let h = startHour; h <= endHour; h++) {
      for (let m = 0; m < 60; m += interval) {
        if (period === "MATTINO" && h === 13 && m > 45) continue;
        if (period === "POMERIGGIO" && h === 19 && m > 0) continue;

        const timeStr = `${h.toString().padStart(2, "0")}:${m
          .toString()
          .padStart(2, "0")}`;

        // Se è oggi, filtra gli orari passati
        const today = new Date();
        const selectedDate = new Date(day + "T00:00:00");

        if (selectedDate.toDateString() === today.toDateString()) {
          const [hh, mm] = timeStr.split(":");
          const slotTime = new Date();
          slotTime.setHours(parseInt(hh), parseInt(mm), 0, 0);

          if (slotTime <= today) continue;
        }

        hours.push(timeStr);
      }
    }
    return hours;
  };
  const slots = generateSlots();

  /* =======================
     FORMAT DATE
     ======================= */
  const formatDate = (dateString: string) => {
    if (!dateString) return "Seleziona data";
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("it-IT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  /* =======================
     DISABLED DATES
     ======================= */
  const getDisabledDates = () => {
    const disabled: {
      [key: string]: { disabled: boolean; disableTouchEvent: boolean };
    } = {};
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 13, 0);

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dayOfWeek = d.getDay();
      const dateStr = d.toISOString().split("T")[0];

      // Disabilita Domenica (1) e Lunedì (2)
      if (dayOfWeek === 1 || dayOfWeek === 2) {
        disabled[dateStr] = { disabled: true, disableTouchEvent: true };
      }

      // Disabilita date passate
      if (d < today) {
        disabled[dateStr] = { disabled: true, disableTouchEvent: true };
      }
    }

    return disabled;
  };

  /* =======================
     SAVE
     ======================= */
  const handleSave = async () => {
    const message = `Sei sicuro di voler modificare l'appuntamento?`;
    const updateSuccess = `Appuntamento aggiornato correttamente`;

    if (!clientId) {
      Alert.alert("Errore", "Seleziona un cliente");
      return;
    }

    if (!service) {
      Alert.alert("Errore", "Seleziona un servizio");
      return;
    }

    if (!day) {
      Alert.alert("Errore", "Seleziona una data");
      return;
    }

    if (!hour) {
      Alert.alert("Errore", "Seleziona un orario");
      return;
    }

    const { error } = await supabase
      .from("appointments")
      .update({
        client_id: clientId,
        appointment_date: day,
        appointment_time: hour,
        service,
        period,
      })
      .eq("id", id);

    if (error) {
      Alert.alert("Errore", error.message);
    } else {
      if (Platform.OS === "web") {
        const confirmed = window.confirm(message);
        if (!confirmed) return;
        window.confirm(updateSuccess);
        updateAndRefresh(id);
      } else {
        Alert.alert("Aggiorna appuntamento", message, [
          { text: "Annulla", style: "cancel" },
          {
            text: "Aggiorna",
            style: "destructive",
            onPress: async () => updateAndRefresh(id),
          },
        ]);
      }
      Alert.alert("Salvato", updateSuccess);
      router.back();
    }
  };

  const updateAndRefresh = async (id: string) => {
    router.replace("/get-appointments");
  };

  if (loading) return null;

  /* =======================
     RENDER
     ======================= */
  return (
    <ScrollView style={styles.container}>
      <ThemedText type="title">Modifica appuntamento</ThemedText>

      {/* DROPDOWN CLIENTE */}
      <Pressable
        onPress={() => {
          setDropdownClientOpen((v) => !v);
          setClientQuery("");
        }}
        style={styles.input}
      >
        <ThemedText>{clientLabel || "Seleziona cliente"}</ThemedText>
      </Pressable>

      {dropdownClientOpen && (
        <>
          <Pressable
            style={styles.overlay}
            onPress={() => {
              setDropdownClientOpen(false);
              setClientQuery("");
            }}
          />

          <View style={styles.dropdown}>
            <TextInput
              placeholder="Cerca cliente..."
              onChangeText={setClientQuery}
              style={styles.search}
            />

            <FlatList
              data={clients.filter((c) =>
                `${c.first_name} ${c.last_name}`
                  .toLowerCase()
                  .includes(clientQuery.toLowerCase())
              )}
              keyExtractor={(c) => c.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setClientId(item.id);
                    const label = `${item.first_name} ${item.last_name}`;
                    setClientLabel(label);
                    setClientQuery(label);
                    setDropdownClientOpen(false);
                  }}
                  style={styles.option}
                >
                  <ThemedText>
                    {item.first_name} {item.last_name}
                  </ThemedText>
                </Pressable>
              )}
            />
          </View>
        </>
      )}

      {/* DROPDOWN SERVIZIO */}
      <Pressable
        onPress={() => setDropdownServiceOpen((v) => !v)}
        style={styles.input}
      >
        <ThemedText>{service || "Seleziona servizio"}</ThemedText>
      </Pressable>

      {dropdownServiceOpen && (
        <>
          <Pressable
            style={styles.overlay}
            onPress={() => setDropdownServiceOpen(false)}
          />

          <View style={styles.dropdown}>
            {getServices().map((s) => (
              <Pressable
                key={s}
                onPress={() => {
                  setService(s);
                  setDropdownServiceOpen(false);
                }}
                style={styles.option}
              >
                <ThemedText>{s}</ThemedText>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* CALENDARIO */}
      <Pressable onPress={() => setCalendarOpen(true)} style={styles.input}>
        <ThemedText>{formatDate(day)}</ThemedText>
      </Pressable>

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
              current={`${visibleMonth.year}-${String(
                visibleMonth.month + 1
              ).padStart(2, "0")}-01`}
              onMonthChange={(month) => {
                setVisibleMonth({
                  month: month.month - 1, // calendar usa 1–12
                  year: month.year,
                });
              }}
              onDayPress={(selectedDay) => {
                setDay(selectedDay.dateString);
                setHour("");
                setCalendarOpen(false);
              }}
              markedDates={{
                ...getDisabledDates(),
                [day]: { selected: true, selectedColor: "green" },
              }}
              theme={{
                todayTextColor: "green",
                arrowColor: "green",
              }}
              minDate={minDate}
              maxDate={maxDate}
              disableArrowLeft={disableArrowLeft}
              disableArrowRight={disableArrowRight}
              enableSwipeMonths={false}
              hideExtraDays
              firstDay={1}
            />
          </View>
        </Pressable>
      </Modal>

      {/* DROPDOWN PERIODO */}
      <Pressable
        onPress={() => setDropdownPeriodOpen((v) => !v)}
        style={styles.input}
      >
        <ThemedText>{period || "Seleziona periodo"}</ThemedText>
      </Pressable>

      {dropdownPeriodOpen && (
        <>
          <Pressable
            style={styles.overlay}
            onPress={() => setDropdownPeriodOpen(false)}
          />

          <View style={styles.dropdown}>
            {(["MATTINO", "POMERIGGIO"] as Period[]).map((p) => (
              <Pressable
                key={p}
                onPress={() => {
                  setPeriod(p);
                  setHour(""); // Reset hour quando cambi periodo
                  setDropdownPeriodOpen(false);
                }}
                style={styles.option}
              >
                <ThemedText>{p}</ThemedText>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* DROPDOWN ORARIO */}
      {period && (
        <>
          <Pressable
            onPress={() => setDropdownHourOpen((v) => !v)}
            style={styles.input}
          >
            <ThemedText>{hour || "Seleziona orario"}</ThemedText>
          </Pressable>

          {dropdownHourOpen && (
            <>
              <Pressable
                style={styles.overlay}
                onPress={() => setDropdownHourOpen(false)}
              />

              <View style={styles.dropdownHour}>
                <ScrollView>
                  {slots.map((slot) => {
                    const isBlocked = blockedSlots.includes(slot);
                    return (
                      <Pressable
                        key={slot}
                        disabled={isBlocked}
                        onPress={() => {
                          setHour(slot);
                          setDropdownHourOpen(false);
                        }}
                        style={[
                          styles.option,
                          isBlocked && styles.disabledOption,
                        ]}
                      >
                        <ThemedText style={isBlocked && styles.disabledText}>
                          {slot}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </>
          )}
        </>
      )}

      <Pressable style={styles.button} onPress={handleSave}>
        <ThemedText style={{ color: "#fff" }}>Salva modifiche</ThemedText>
      </Pressable>
    </ScrollView>
  );
}

/* =======================
   STYLES
   ======================= */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  label: { marginTop: 12, marginBottom: 4 },

  input: {
    borderWidth: 1,
    borderColor: "#888",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    maxHeight: 220,
    marginBottom: 12,
    backgroundColor: "#fff",
    zIndex: 2,
  },

  dropdownHour: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    maxHeight: 300,
    marginBottom: 12,
    backgroundColor: "#fff",
    zIndex: 2,
  },

  search: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  option: {
    padding: 10,
  },

  disabledOption: {
    backgroundColor: "#f5f5f5",
    opacity: 0.5,
  },

  disabledText: {
    textDecorationLine: "line-through",
    color: "#999",
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

  button: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 40,
  },
});
