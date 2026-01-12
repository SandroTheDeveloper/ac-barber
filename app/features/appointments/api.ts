import { supabase } from "@/app/services/supabase";

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
