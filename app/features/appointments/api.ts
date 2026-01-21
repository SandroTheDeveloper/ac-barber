import { supabase } from "@/app/services/supabase";
import { Appointment } from "./types";
import { DateFilter } from "./hooks/useAppointments";

// GET APPOINTMENT BY ID
export const getMyAppointments = async (clientId: string) => {
  return supabase
    .from("appointments")
    .select(`
      id,
      appointment_date,
      appointment_time,
      service,
      status,
      clients (
        first_name,
        last_name,
        phone
      )
    `)
    .eq("client_id", clientId)
    .order("appointment_date", { ascending: true });
};

// CREATE
export async function createAppointment({
  clientId,
  date,
  hour,
  service,
  period,
}: {
  clientId: string;
  date: string;
  hour: string;
  service: "TAGLIO" | "BARBA" | "TAGLIO+BARBA";
  period: "MATTINO" | "POMERIGGIO";
}) {
  const appointmentDate = date.split("T")[0];

  const { error } = await supabase.from("appointments").insert({
    client_id: clientId,
    appointment_date: appointmentDate,
    appointment_time: hour,
    service,
    period,
  });

  if (error) throw error;
}
// appuntamenti confermati
export async function getBookedHours(date: string) {
  const day = date.split("T")[0];

  const { data, error } = await supabase
    .from("appointments")
    .select("appointment_time")
    .eq("appointment_date", day)
    .eq("status", "CONFIRMED");

  if (error) throw error;

  return data.map((a) => a.appointment_time);
}
// lista appuntamenti per ADMIN
export async function getAppointments(
  filter: DateFilter,
  selectedDate?: string | null
): Promise<Appointment[]> {
  const today = new Date().toISOString().split("T")[0];

  let query = supabase
    .from("appointments")
    .select(
      `
      id,
      appointment_date,
      appointment_time,
      service,
      status,
      clients (
        first_name,
        last_name,
        phone
      )
    `
    )
    .order("appointment_date", { ascending: true });

  switch (filter) {
    case "TODAY":
      query = query.eq("appointment_date", today);
      break;
    case "DATE":
      if (selectedDate) query = query.eq("appointment_date", selectedDate);
      break;
    case "PAST":
      query = query.lt("appointment_date", today);
      break;
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((a: any) => ({
    id: a.id,
    appointment_date: a.appointment_date,
    appointment_time: a.appointment_time,
    service: a.service,
    status: a.status,
    client: a.clients,
  }));
}
// DELETE APPOINTMENT BY ID
export async function deleteAppointment(id: string): Promise<boolean> {
  const { error } = await supabase.from("appointments").delete().eq("id", id);
  return !error;
}
