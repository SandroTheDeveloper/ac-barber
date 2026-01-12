import { useEffect, useState } from "react";
import { getMyAppointments } from "./api";
import { Appointment } from "./types";

export const useMyAppointments = (
  clientId: string | null,
  filters: { date?: string }
) => {
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clientId) return;

    setLoading(true);
    getMyAppointments(clientId).then(({ data }) => {
      setData(
        data?.map(a => ({
          ...a,
          client: a.clients?.[0] ?? null,
        })) ?? []
      );
      setLoading(false);
    });
  }, [clientId, filters]);

  return { data, loading };
};
