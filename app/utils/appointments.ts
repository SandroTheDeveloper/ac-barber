import { supabase } from "@/app/utils/supabase";
import { Appointment } from "../getAppointments";

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
export async function getAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
  .select("*");


  if (error) throw error;

  // Supabase può restituire client come array (1 elemento) → prendiamo il primo
  const appointments: Appointment[] = (data ?? []).map((a: any) => ({
    id: a.id,
    appointment_date: a.appointment_date,
    appointment_time: a.appointment_time,
    service: a.service,
    status: a.status,
    client: a.client ?? null,
  }));

  console.log("appointments debug", appointments); // per verificare
  return appointments;
}