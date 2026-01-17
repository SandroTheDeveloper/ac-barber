import { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { supabase } from "../services/supabase";
import { getBlockedSlots, getServices } from "../services/helper";
import { styles } from "./styles";
import { CalendarPicker } from "@/components/ui/calendar/CalendarPicker";
import { Period, Service } from "../features/appointments/types";

type Client = {
  id: string;
  first_name: string;
  last_name: string;
};

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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Hour state
  const [hour, setHour] = useState("");
  const [period, setPeriod] = useState<Period | null>(null);
  const [dropdownPeriodOpen, setDropdownPeriodOpen] = useState(false);
  const [dropdownHourOpen, setDropdownHourOpen] = useState(false);
  const [bookedHours, setBookedHours] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [originalAppointmentTime, setOriginalAppointmentTime] = useState("");

  const blockedSlots = service ? getBlockedSlots(bookedHours, service) : [];

  //LOAD APPOINTMENT
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
      const cleanHour = appointmentData.appointment_time.slice(0, 5);

      setDay(appointmentData.appointment_date);
      setHour(cleanHour);
      setOriginalAppointmentTime(cleanHour);
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

  //LOAD CLIENTS
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

  //LOAD BOOKED HOURS
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
          .map((a) => a.appointment_time.slice(0, 5));
        setBookedHours(hours);
      }
    };

    loadBookedHours();
  }, [day, id]);

  //GENERATE HOUR SLOTS
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

  //FORMAT DATE
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

  //SAVE
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

  //RENDER
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
            <CalendarPicker
              value={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setDay(date);
                setCalendarOpen(false);
              }}
              disabledWeekDays={[0, 1]}
              showSelectedLabel
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
