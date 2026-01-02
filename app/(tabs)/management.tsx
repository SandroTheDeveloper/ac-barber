// screens/ClientsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  FlatList,
  Text,
  StyleSheet,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import {
  addClient,
  getClients,
  updateClient,
  deleteClient,
  Client,
} from "@/app/utils/client";
import CreateAccount from "../createAccount";
import { useRouter } from "expo-router";

export default function ClientsScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editingId, setEditingId] = useState("");
  const router = useRouter();

  const loadClients = async () => {
    const data = await getClients();
    setClients(data);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleSubmit = async () => {
    if (!firstName || !lastName) return alert("Nome e Cognome obbligatori");

    if (editingId) {
      await updateClient(editingId, {
        first_name: firstName,
        last_name: lastName,
        phone,
        email,
        password,
      });
      setEditingId("");
    } else {
      await addClient({
        first_name: firstName,
        last_name: lastName,
        phone,
        email,
        password,
      });
    }

    setFirstName("");
    setLastName("");
    setPhone("");
    setEmail("");
    setPassword("");
    loadClients();
  };

  const handleEdit = (client: Client) => {
    setEditingId(client.id!);
    setFirstName(client.first_name);
    setLastName(client.last_name);
    setPhone(client.phone || "");
    setEmail(client.email || "");
    setPassword(client.password || "");
  };

  const handleDelete = async (id: string) => {
    await deleteClient(id);
    loadClients();
  };

  return (
    <View>
      <Pressable
        style={styles.button}
        onPress={() => {
          console.log("Premuto Aggiungi cliente");
          router.push("/createAccount");
        }}
      >
        <ThemedText>Aggiungi un cliente</ThemedText>
      </Pressable>
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
