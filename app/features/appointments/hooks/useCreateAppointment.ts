import { useEffect, useState, useMemo } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../services/supabase";
import { generateSlots, getBlockedSlots, isSlotAvailable } from "../../../services/helper";
import { Period, Service } from "../types";

export type Client = {
  id: string;
  first_name: string;
  last_name: string;
};

export function useCreateAppointment(id?: string) {
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientLabel, setClientLabel] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [service, setService] = useState<Service | null>(null);
  const [day, setDay] = useState("");
  const [hour, setHour] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period | null>(null);
  const [bookedHours, setBookedHours] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. CARICAMENTO DATI INIZIALI
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
        if (clientData) {
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

  // 3. CARICAMENTO ORE OCCUPATE
  useEffect(() => {
    if (!day) return;
    const loadBookedHours = async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("appointment_time, id")
        .eq("appointment_date", day)
        .eq("status", "CONFIRMED");

      if (!error && data) {
        const hours = data
          .filter((a) => a.id !== id)
          .map((a) => a.appointment_time.slice(0, 5));
        setBookedHours(hours);
      }
    };
    loadBookedHours();
  }, [day, id]);

  // 4. CALCOLO SLOT BLOCCATI
  const finalBlockedSlots = useMemo(() => {
    if (!service || bookedHours.length === 0) {
      return bookedHours;
    }
    return getBlockedSlots(bookedHours, service);
  }, [bookedHours, service]);

  // 5. CALCOLO SLOT DISPONIBILI
  const availableSlots = useMemo(() => {
    const allSlots = generateSlots(period, day);

    if (!service) return allSlots;

    return allSlots.filter(slot =>
      isSlotAvailable(slot, service, finalBlockedSlots)
    );
  }, [period, day, service, finalBlockedSlots]);

  // 6. AZIONE DI SALVATAGGIO
  const save = async (isUpdate: boolean = false) => {
    if (!clientId || !service || !day || !hour) {
      throw new Error("Tutti i campi sono obbligatori");
    } else if (!isSlotAvailable(hour, service, finalBlockedSlots)) {
      throw new Error("L'orario selezionato non è più disponibile");
    }

    // 1. Controllo se il cliente ha già una prenotazione per quel giorno
    let queryCheck = supabase
      .from("appointments")
      .select("id")
      .eq("client_id", clientId)
      .eq("appointment_date", day)

    // Se stiamo modificando (isUpdate), escludiamo l'appuntamento attuale dal controllo
    if (isUpdate && id) {
      queryCheck = queryCheck.neq("id", id);
    }

    const { data: existingApp, error: checkError } = await queryCheck;

    if (checkError) throw new Error("Errore durante il controllo dei dati");

    if (existingApp && existingApp.length > 0) {
      throw new Error("Questo cliente ha già un appuntamento prenotato per questa giornata.");
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
    state: {
      clientId,
      clientLabel,
      clients,
      service,
      day,
      hour,
      period,
      bookedHours: finalBlockedSlots,
      availableSlots,
      loading
    },
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