import { useEffect, useState } from "react";
import { Appointment, DateFilter } from "../types";
import { getAppointments, deleteAppointment } from "../api";

export function useAppointments(
  dateFilter: DateFilter,
  selectedDate?: string | null
) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getAppointments(dateFilter, selectedDate);
      setAppointments(data);
      setLoading(false);
    };

    load();
  }, [dateFilter, selectedDate]);

  const remove = async (id: string) => {
    const success = await deleteAppointment(id);
    if (success) {
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return {
    appointments,
    loading,
    remove,
  };
}
