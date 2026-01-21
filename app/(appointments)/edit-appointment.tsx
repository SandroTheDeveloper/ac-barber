import React, { useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { formatDate, getServices } from "../services/helper";
import { styles } from "./styles";
import { CalendarPicker } from "@/components/ui/calendar/CalendarPicker";
import { ButtonConfirm } from "@/components/ui/button/ButtonConfirm";
import { ButtonCancel } from "@/components/ui/button/ButtonCancel";
import { Period } from "../features/appointments/types";
import { useCreateAppointment } from "../features/appointments/hooks/useCreateAppointment";

export default function EditAppointment() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Hook Custom: gestisce tutta la logica di stato e database
  const { state, actions } = useCreateAppointment(id);

  const [dropdownClientOpen, setDropdownClientOpen] = useState(false);
  const [clientQuery, setClientQuery] = useState("");
  const [dropdownServiceOpen, setDropdownServiceOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dropdownPeriodOpen, setDropdownPeriodOpen] = useState(false);
  const [dropdownHourOpen, setDropdownHourOpen] = useState(false);

  const handleUpdate = async () => {
    try {
      await actions.save(true);
      Alert.alert("Successo", "Appuntamento aggiornato correttamente");
      router.replace("/get-appointments");
    } catch (error: any) {
      Alert.alert("Errore", error.message || "Impossibile aggiornare");
    }
  };

  if (state.loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", flex: 1 }]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <ThemedText type="title" style={{ marginBottom: 20 }}>
        Modifica appuntamento
      </ThemedText>

      {/* DROPDOWN CLIENTE */}
      <ThemedText style={styles.label}>Cliente</ThemedText>
      <Pressable
        onPress={() => {
          setDropdownClientOpen((v) => !v);
          setClientQuery("");
        }}
        style={styles.input}
      >
        <ThemedText>{state.clientLabel || "Seleziona cliente"}</ThemedText>
      </Pressable>

      {dropdownClientOpen && (
        <View style={styles.dropdown}>
          <TextInput
            placeholder="Cerca..."
            onChangeText={setClientQuery}
            style={styles.search}
            autoFocus
          />
          <FlatList
            data={state.clients.filter((c) =>
              `${c.first_name} ${c.last_name}`
                .toLowerCase()
                .includes(clientQuery.toLowerCase())
            )}
            keyExtractor={(c) => c.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  actions.setClientId(item.id);
                  actions.setClientLabel(
                    `${item.first_name} ${item.last_name}`
                  );
                  setDropdownClientOpen(false);
                }}
                style={styles.option}
              >
                <ThemedText>
                  {item.first_name} {item.last_name}
                </ThemedText>
              </Pressable>
            )}
            style={{ maxHeight: 200 }}
          />
        </View>
      )}

      {/* DROPDOWN SERVIZIO */}
      <ThemedText style={styles.label}>Servizio</ThemedText>
      <Pressable
        onPress={() => setDropdownServiceOpen((v) => !v)}
        style={styles.input}
      >
        <ThemedText>{state.service || "Seleziona servizio"}</ThemedText>
      </Pressable>
      {dropdownServiceOpen && (
        <View style={styles.dropdown}>
          {getServices().map((s) => (
            <Pressable
              key={s}
              onPress={() => {
                actions.setService(s);
                setDropdownServiceOpen(false);
              }}
              style={styles.option}
            >
              <ThemedText>{s}</ThemedText>
            </Pressable>
          ))}
        </View>
      )}

      {/* CALENDARIO */}
      <ThemedText style={styles.label}>Data</ThemedText>
      <Pressable onPress={() => setCalendarOpen(true)} style={styles.input}>
        <ThemedText>{formatDate(state.day)}</ThemedText>
      </Pressable>
      <Modal visible={calendarOpen} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCalendarOpen(false)}
        >
          <View style={styles.calendarContainer}>
            <CalendarPicker
              value={state.day}
              onSelectDate={(date) => {
                actions.setDay(date);
                setCalendarOpen(false);
              }}
              disabledWeekDays={[0, 1]}
            />
          </View>
        </Pressable>
      </Modal>

      {/* DROPDOWN PERIODO */}
      <ThemedText style={styles.label}>Fascia Oraria</ThemedText>
      <Pressable
        onPress={() => setDropdownPeriodOpen((v) => !v)}
        style={styles.input}
      >
        <ThemedText>{state.period || "Seleziona periodo"}</ThemedText>
      </Pressable>
      {dropdownPeriodOpen && (
        <View style={styles.dropdown}>
          {(["MATTINO", "POMERIGGIO"] as Period[]).map((p) => (
            <Pressable
              key={p}
              onPress={() => {
                actions.setPeriod(p);
                actions.setHour(null);
                setDropdownPeriodOpen(false);
              }}
              style={styles.option}
            >
              <ThemedText>{p}</ThemedText>
            </Pressable>
          ))}
        </View>
      )}

      {/* DROPDOWN ORARIO */}
      {state.period && (
        <>
          <ThemedText style={styles.label}>Orario</ThemedText>
          <Pressable
            onPress={() => setDropdownHourOpen((v) => !v)}
            style={styles.input}
          >
            <ThemedText>{state.hour || "Seleziona orario"}</ThemedText>
          </Pressable>
          {dropdownHourOpen && (
            <View style={styles.dropdownHour}>
              <ScrollView nestedScrollEnabled>
                {state.availableSlots.map((slot) => {
                  const isBlocked = state.bookedHours.includes(slot);
                  return (
                    <Pressable
                      key={slot}
                      disabled={isBlocked}
                      onPress={() => {
                        actions.setHour(slot);
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
          )}
        </>
      )}

      <View style={{ marginTop: 30, gap: 10, marginBottom: 50 }}>
        <ButtonConfirm onPress={handleUpdate} message="Aggiorna Appuntamento" />
        <ButtonCancel />
      </View>
    </ScrollView>
  );
}
