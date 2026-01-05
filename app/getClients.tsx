// screens/ClientsScreen.tsx
import React, { useCallback, useEffect, useState } from "react";
import { View, Pressable, FlatList, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { getClients, deleteClient, Client } from "@/app/utils/client";
import { useFocusEffect, useRouter } from "expo-router";

export default function GetClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const router = useRouter();

  const loadClients = async () => {
    const data = await getClients();
    setClients(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadClients();
    }, [])
  );

  const handleEdit = (client: Client) => {
    router.push({
      pathname: "/edit-client",
      params: { id: client.id },
    });
  };

  const handleDelete = async (id: string) => {
    await deleteClient(id);
    loadClients();
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title">{"Lista Clienti"}</ThemedText>

      <FlatList
        data={clients}
        keyExtractor={(item) => item.id!.toString()}
        renderItem={({ item }) => (
          <View style={styles.clientRow}>
            <ThemedText>
              {item.first_name} {item.last_name} | {item.phone} | {item.email}
            </ThemedText>
            <View style={styles.rowButtons}>
              <Pressable
                onPress={() => handleEdit(item)}
                style={styles.editButton}
              >
                <ThemedText>Modifica</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => handleDelete(item.id!)}
                style={styles.deleteButton}
              >
                <ThemedText>Elimina</ThemedText>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#888",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  clientRow: { paddingVertical: 8, borderBottomWidth: 1, borderColor: "#ccc" },
  rowButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  editButton: {
    marginRight: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 6,
  },
  deleteButton: {
    padding: 6,
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 6,
  },
});
