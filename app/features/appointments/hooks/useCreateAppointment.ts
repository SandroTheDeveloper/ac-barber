import { useEffect, useState, useMemo } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../services/supabase";
import { generateSlots } from "../../../services/helper";
import { Period, Service } from "../types";

export type Client = {
  id: string;
  first_name: string;
  last_name: string;
};

export function useCreateAppointment(id?: string) {
  // --- STATO DATI ---
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientLabel, setClientLabel] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [service, setService] = useState<Service | null>(null);
  const [day, setDay] = useState("");
  const [hour, setHour] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period | null>(null);
  const [bookedHours, setBookedHours] = useState<string[]>([]);
  
  // --- STATO UI ---
  const [loading, setLoading] = useState(false);

  // 1. CARICAMENTO DATI INIZIALI (Se c'è un ID)
  useEffect(() => {
    if (!id) return;

    const loadAppointment = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          appointment_date,
          appointment_time,
          service,
          client_id,
          clients (id, first_name, last_name)
        `)
        .eq("id", id)
        .single();

      if (error) {
        Alert.alert("Errore", "Impossibile caricare l'appuntamento");
      } else if (data) {
        const cleanHour = data.appointment_time.slice(0, 5);
        setDay(data.appointment_date);
        setHour(cleanHour);
        setService(data.service as Service);
        setClientId(data.client_id);
        
        const hourNum = parseInt(cleanHour.split(":")[0]);
        setPeriod(hourNum < 14 ? "MATTINO" : "POMERIGGIO");
        const clientData = Array.isArray(data.clients) ? data.clients[0] : data.clients;

        if (data.clients) {
         setClientLabel(`${clientData.first_name} ${clientData.last_name}`);
        }
      }
      setLoading(false);
    };

    loadAppointment();
  }, [id]);

  // 2. CARICAMENTO LISTA CLIENTI
  useEffect(() => {
    const loadClients = async () => {
      const { data } = await supabase
        .from("clients")
        .select("id, first_name, last_name")
        .order("last_name");
      if (data) setClients(data);
    };
    loadClients();
  }, []);

  // 3. CARICAMENTO ORE OCCUPATE (Dipende dal giorno selezionato)
  useEffect(() => {
    if (!day) return;

    const loadBookedHours = async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("appointment_time, id")
        .eq("appointment_date", day)
        .eq("status", "CONFIRMED");

      if (!error && data) {
        // Escludiamo l'appuntamento corrente se siamo in modifica
        const hours = data
          .filter((a) => a.id !== id)
          .map((a) => a.appointment_time.slice(0, 5));
        setBookedHours(hours);
      }
    };

    loadBookedHours();
  }, [day, id]);

  // 4. CALCOLO SLOT DISPONIBILI
  const availableSlots = useMemo(() => {
    return generateSlots(period, day);
  }, [period, day]);

  // 5. AZIONE DI SALVATAGGIO
const save = async (isUpdate: boolean = false) => {
  if (!clientId || !service || !day || !hour) {
    throw new Error("Tutti i campi sono obbligatori");
  }

  const payload = {
    client_id: clientId,
    appointment_date: day,
    appointment_time: hour,
    service,
    period,
  };

  const query = isUpdate 
    ? supabase.from("appointments").update(payload).eq("id", id)
    : supabase.from("appointments").insert(payload);

  const { error } = await query;
  if (error) throw error;
  return { success: true };
};

  return {
    // Esponiamo lo stato
    state: {
      clientId,
      clientLabel,
      clients,
      service,
      day,
      hour,
      period,
      bookedHours,
      availableSlots,
      loading
    },
    // Esponiamo le azioni per modificare lo stato
    actions: {
      setClientId,
      setClientLabel,
      setService,
      setDay,
      setHour,
      setPeriod,
      save
    }
  };
}