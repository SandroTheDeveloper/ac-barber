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
  Platform,
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

export default function CreateAppointment() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Hook Custom: gestisce tutta la logica di stato e database
  const { state, actions } = useCreateAppointment(id);

  // Stati locali per la gestione dell'interfaccia (apertura/chiusura menu)
  const [dropdownClientOpen, setDropdownClientOpen] = useState(false);
  const [clientQuery, setClientQuery] = useState("");
  const [dropdownServiceOpen, setDropdownServiceOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dropdownPeriodOpen, setDropdownPeriodOpen] = useState(false);
  const [dropdownHourOpen, setDropdownHourOpen] = useState(false);

  const handleSave = async () => {
    try {
      await actions.save(!!id);
      Alert.alert("Successo", "Appuntamento registrato con successo");
      if (Platform.OS === "web") {
        const confirmed = window.confirm(
          "Appuntamento registrato con successo",
        );
        if (!confirmed) return;
      }
      router.replace("/get-appointments");
    } catch (error: any) {
      Alert.alert(
        "Attenzione",
        "Il cliente ha già un appuntamento per la data selzionata",
      );
      if (Platform.OS === "web") {
        const confirmed = window.confirm(
          "Il cliente ha già un appuntamento per la data selzionata",
        );
        if (!confirmed) return;
      }
    }
  };

  if (state.loading) {
    return (
      <View style={[styles.createAppContainer, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.createAppContainer}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedText type="title" style={{ marginBottom: 20 }}>
        {id ? "Modifica Appuntamento" : "Crea un nuovo appuntamento"}
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
        <>
          <Pressable
            style={styles.overlay}
            onPress={() => setDropdownClientOpen(false)}
          />
          <View style={styles.dropdown}>
            <TextInput
              placeholder="Cerca cliente..."
              onChangeText={setClientQuery}
              style={styles.search}
              autoFocus
            />
            <FlatList
              data={state.clients.filter((c) =>
                `${c.first_name} ${c.last_name}`
                  .toLowerCase()
                  .includes(clientQuery.toLowerCase()),
              )}
              keyExtractor={(c) => c.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    actions.setClientId(item.id);
                    actions.setClientLabel(
                      `${item.first_name} ${item.last_name}`,
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
              nestedScrollEnabled
            />
          </View>
        </>
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
                  actions.setService(s);
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
              showSelectedLabel
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
        </>
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
            <>
              <Pressable
                style={styles.overlay}
                onPress={() => setDropdownHourOpen(false)}
              />
              <View style={styles.dropdownHour}>
                <ScrollView nestedScrollEnabled>
                  {state.availableSlots.map((slot) => {
                    // Nota: Qui usiamo state.bookedHours che viene popolato dall'hook
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
            </>
          )}
        </>
      )}

      <View style={{ marginTop: 30, gap: 10, marginBottom: 50 }}>
        <ButtonConfirm onPress={handleSave} message="Conferma" />
        <ButtonCancel />
      </View>
    </ScrollView>
  );
}
