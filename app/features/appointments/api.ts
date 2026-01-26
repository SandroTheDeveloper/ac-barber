import { supabase } from "@/app/services/supabase";
import { Appointment, DateFilter } from "./types";
import { generateSlots, getBlockedSlots, isSlotAvailable } from "@/app/services/helper";

// GET APPOINTMENT BY ID
export async function getMyAppointments(
  clientId: string,
  filter: DateFilter,
  selectedDate?: string | null
): Promise<Appointment[]> {
  const today = new Date().toISOString().split("T")[0];

  let query = supabase
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
    .eq("client_id", clientId);

  // Applichiamo i filtri alla query
  switch (filter) {
    case "TODAY":
      query = query.eq("appointment_date", today);
      break;
    case "DATE":
      if (selectedDate) {
        query = query.eq("appointment_date", selectedDate);
      }
      break;
    case "PAST":
      query = query.lt("appointment_date", today);
      break;
  }

  // Ordiniamo e finalmente eseguiamo la chiamata
  const { data, error } = await query.order("appointment_date", { ascending: false });

  if (error || !data) {
    console.error("Errore fetch appuntamenti:", error);
    return [];
  }

  // Mappiamo i dati per risolvere il problema dell'array in 'clients'
  return data.map((a: any) => ({
    id: a.id,
    appointment_date: a.appointment_date,
    appointment_time: a.appointment_time,
    service: a.service,
    status: a.status,
    // Risolviamo l'errore di tipo: prendiamo il primo elemento se è un array
    client: Array.isArray(a.clients) ? a.clients[0] : a.clients,
  }));
}

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

export async function getFullDatesFromSupabase(): Promise<string[]> {
  // 1. Prendiamo solo gli appuntamenti confermati
  const { data, error } = await supabase
    .from("appointments")
    .select("appointment_date, appointment_time")
    .eq("status", "CONFIRMED");

  if (error || !data) return [];

  // 2. Raggruppiamo gli orari per data
  const grouped = data.reduce((acc: Record<string, string[]>, curr) => {
    acc[curr.appointment_date] = [...(acc[curr.appointment_date] || []), curr.appointment_time];
    return acc;
  }, {});

  // 3. Analizziamo quali date sono sature
  const minService = "BARBA"; // Usiamo il servizio più corto come test di "pieno"

  return Object.keys(grouped).filter((date) => {
    const bookedHours = grouped[date];
    const blockedSlots = getBlockedSlots(bookedHours, minService);

    // Controlliamo la disponibilità reale considerando l'orario attuale (passiamo 'date')
    const allPossibleSlots = [
      ...generateSlots("MATTINO", date),
      ...generateSlots("POMERIGGIO", date)
    ];

    // Se non c'è nemmeno uno slot libero per una barba, il giorno è pieno
    const hasSpace = allPossibleSlots.some(slot =>
      isSlotAvailable(slot, minService, blockedSlots)
    );

    return !hasSpace;
  });
}
