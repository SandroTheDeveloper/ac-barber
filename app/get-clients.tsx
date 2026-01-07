import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Pressable,
  FlatList,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { getClients, deleteClient, Client } from "@/app/utils/client";
import { Stack, useFocusEffect, useRouter } from "expo-router";

export default function ClientsScreen() {
  const PAGE_SIZE = 10;

  const [clients, setClients] = useState<Client[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState("");
  const router = useRouter();

  // 🔹 Carica clienti dal DB
  const loadClients = async () => {
    const data = await getClients();
    setClients(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadClients();
    }, [])
  );

  // 🔹 Modifica cliente
  const handleEdit = (client: Client) => {
    router.push({ pathname: "/edit-client", params: { id: client.id } });
  };

  // 🔹 Elimina cliente con conferma
  const handleDelete = (id: string, client: Client) => {
    const message = `Sei sicuro di voler eliminare ${client.first_name} ${client.last_name}?`;

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
    await deleteClient(id);
    loadClients();
  };

  // 🔍 Filtra clienti
  const filteredClients = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.first_name.toLowerCase().includes(q) ||
        c.last_name.toLowerCase().includes(q) ||
        (c.phone?.toLowerCase().includes(q) ?? false) ||
        (c.email?.toLowerCase().includes(q) ?? false)
    );
  }, [clients, search]);

  // 🔹 Pagina corrente
  const paginatedClients = filteredClients.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  );

  const totalPages = Math.ceil(filteredClients.length / PAGE_SIZE);

  // 🔹 Render singolo cliente
  const renderItem = ({ item }: { item: Client }) => (
    <View style={styles.card}>
      <ThemedText type="defaultSemiBold" style={styles.name}>
        {item.first_name} {item.last_name}
      </ThemedText>

      {item.email && (
        <View style={styles.row}>
          <Ionicons name="mail-outline" size={16} color="#555" />
          <ThemedText style={styles.meta}>{item.email}</ThemedText>
        </View>
      )}
      {item.phone && (
        <View style={styles.row}>
          <Ionicons name="call-outline" size={16} color="#555" />
          <ThemedText style={styles.meta}>{item.phone}</ThemedText>
        </View>
      )}

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

  return (
    <>
      <Stack.Screen
        options={{
          title: "Torna indietro",
          headerBackTitle: "Indietro", // iOS
        }}
      />
      <View style={styles.container}>
        <ThemedText type="title">Lista Clienti</ThemedText>

        {/* 🔍 Search */}
        <TextInput
          placeholder="Cerca per nome, email o numero telefonico"
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            setCurrentPage(0); // reset pagina se cambia filtro
          }}
          style={styles.search}
        />

        {/* 🔹 Lista clienti */}
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
