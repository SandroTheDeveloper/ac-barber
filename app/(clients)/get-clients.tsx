import React, { useMemo, useState } from "react";
import {
  View,
  Pressable,
  FlatList,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { Stack, useRouter } from "expo-router";
import { useClients } from "../features/clients/hooks/useClients";
import { Client } from "../features/clients/types";
import { styles } from "./styles";

export default function ClientsScreen() {
  const PAGE_SIZE = 10;

  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { clients, loading, remove } = useClients();

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
    await remove(id);
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
