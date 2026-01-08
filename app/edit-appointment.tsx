import { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/app/utils/supabase";
import { ThemedText } from "@/components/themed-text";

type Client = {
  id: string;
  first_name: string;
  last_name: string;
};

export default function EditAppointment() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [clientId, setClientId] = useState<string | null>(null);
  const [clientLabel, setClientLabel] = useState("");
  const [clientQuery, setClientQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [dropdownClientOpen, setDropdownClientOpen] = useState(false);
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [service, setService] = useState("");

  const [loading, setLoading] = useState(true);

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
          client:clients (
            id,
            first_name,
            last_name
          )
        `
        )
        .eq("id", id)
        .single();

      if (error || !data) {
        Alert.alert("Errore", "Appuntamento non trovato");
        router.back();
        return;
      }

      const client = data.client[0];

      setDay(data.appointment_date);
      setHour(data.appointment_time);
      setService(data.service);
      setClientId(data.client_id);

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
    if (!dropdownClientOpen) return;

    supabase
      .from("clients")
      .select("id, first_name, last_name")
      .order("last_name")
      .then(({ data }) => {
        if (data) setClients(data);
      });
  }, [dropdownClientOpen]);

  /* =======================
     SAVE
     ======================= */
  const handleSave = async () => {
    if (!clientId) {
      Alert.alert("Errore", "Seleziona un cliente");
      return;
    }

    const { error } = await supabase
      .from("appointments")
      .update({
        client_id: clientId,
        appointment_date: day,
        appointment_time: hour,
        service,
      })
      .eq("id", id);

    if (error) {
      Alert.alert("Errore", error.message);
    } else {
      Alert.alert("Salvato", "Appuntamento aggiornato");
      router.back();
    }
  };

  if (loading) return null;

  /* =======================
     RENDER
     ======================= */
  return (
    <View style={styles.container}>
      <ThemedText type="title">Modifica appuntamento</ThemedText>

      <Pressable
        onPress={() => setDropdownClientOpen((v) => !v)}
        style={styles.input}
      >
        <ThemedText>{clientLabel}</ThemedText>
      </Pressable>

      {dropdownClientOpen && (
        <View style={styles.dropdown}>
          <TextInput
            placeholder="Cerca cliente..."
            value={clientQuery}
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
      )}

      {/* SERVIZIO */}
      <TextInput
        value={service}
        onChangeText={setService}
        placeholder="Servizio"
        style={styles.input}
      />

      {/* DATA */}
      <TextInput
        value={day}
        onChangeText={setDay}
        placeholder="Data (YYYY-MM-DD)"
        style={styles.input}
      />

      {/* ORA */}
      <TextInput
        value={hour}
        onChangeText={setHour}
        placeholder="Ora (HH:mm)"
        style={styles.input}
      />

      <Pressable style={styles.button} onPress={handleSave}>
        <ThemedText style={{ color: "#fff" }}>Salva modifiche</ThemedText>
      </Pressable>
    </View>
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

  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    maxHeight: 220,
    marginBottom: 12,
  },

  search: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  option: {
    padding: 10,
  },

  button: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
});
