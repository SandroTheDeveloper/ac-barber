// features/clients/hooks/useClient.ts
import { useEffect, useState } from "react";
import { Client } from "../types";
import { getClientById, updateClient } from "../api";

export function useClient(id?: string) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      const data = await getClientById(id);
      setClient(data);
      setLoading(false);
    };

    load();
  }, [id]);

  const save = async (updates: Partial<Client>) => {
    if (!id) return false;
    const success = await updateClient(id, updates);
    return success;
  };

  return {
    client,
    loading,
    save,
  };
}
