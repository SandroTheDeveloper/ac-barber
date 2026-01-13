import { useEffect, useState } from "react";
import { Client } from "../types";
import { deleteClient, getClients } from "../api";

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await getClients();
    setClients(data);
    setLoading(false);
  };

    const remove = async (id: string) => {
    await deleteClient(id);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return {
    clients,
    loading,
    reload: load,
    remove,
  };
}
