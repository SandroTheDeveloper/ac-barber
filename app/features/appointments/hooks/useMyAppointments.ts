import { useCallback, useEffect, useState } from "react";
import { deleteAppointment, getMyAppointments } from "../api";
import { Appointment, DateFilter } from "../types";

export const useMyAppointments = (
  clientId: string | null,
  dateFilter: DateFilter,
  selectedDate?: string | null

) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!clientId) return;

    setLoading(true);
    const data = await getMyAppointments(clientId, dateFilter, selectedDate); setAppointments(data);
    setLoading(false);
  }, [clientId, dateFilter, selectedDate]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id: string) => {
    const success = await deleteAppointment(id);
    if (success) {
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return { appointments, loading, remove };
};
