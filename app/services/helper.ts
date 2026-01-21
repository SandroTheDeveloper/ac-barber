import { LocaleConfig } from "react-native-calendars";
import { Period, Service } from "../features/appointments/types";

export function formatAppointmentDate(
  date: string,
  time: string
) {
  const d = new Date(`${date}T${time}`);

  const weekday = d.toLocaleDateString("it-IT", {
    weekday: "long",
  });

  const day = d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const hour = d.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    weekday, // es: "martedì"
    day,     // es: "06/01/2026"
    hour,    // es: "10:15"
  };
}

  //FORMAT DATE
  export function formatDate (dateString: string) {
    if (!dateString) return "Seleziona data";
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("it-IT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

// Configurazione italiana del calendario
LocaleConfig.locales["it"] = {
  monthNames: [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ],
  monthNamesShort: [
    "Gen",
    "Feb",
    "Mar",
    "Apr",
    "Mag",
    "Giu",
    "Lug",
    "Ago",
    "Set",
    "Ott",
    "Nov",
    "Dic",
  ],
  dayNames: [
    "Domenica",
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
  ],
  dayNamesShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
  today: "Oggi",
};
LocaleConfig.defaultLocale = "it";

const SERVICES: Service[] = ["TAGLIO", "BARBA", "TAGLIO+BARBA"];
export function getServices () {
  return SERVICES;
};

const getServiceDuration = (service: Service) => {
  switch (service) {
    case "BARBA":
      return 30;
    case "TAGLIO":
    case "TAGLIO+BARBA":
      return 60;
    default:
      return 0;
  }
};

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export function getBlockedSlots (bookedHours: string[], service: Service): string[]  {
  const duration = getServiceDuration(service);
  const interval = 15;
  const slotsToBlock = duration / interval;

  const blocked = new Set<string>();

  bookedHours.forEach((start) => {
    const startMinutes = toMinutes(start);

    for (let i = 0; i < slotsToBlock; i++) {
      const minutes = startMinutes + i * interval;
      const h = Math.floor(minutes / 60)
        .toString()
        .padStart(2, "0");
      const m = (minutes % 60).toString().padStart(2, "0");
      blocked.add(`${h}:${m}`);
    }
  });

  return Array.from(blocked);
};

//GENERATE HOUR SLOTS
export function generateSlots (period: Period | null, day: string): string[] {
  if (!period) return [];

  const hours: string[] = [];
  const startHour = period === "MATTINO" ? 9 : 14;
  const endHour = period === "MATTINO" ? 13 : 19;
  const interval = 15;

  const now = new Date();
  // Creiamo un riferimento per l'inizio di oggi senza ore/minuti
  const todayStr = now.toISOString().split('T')[0]; 

  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += interval) {
      // Limiti di fine turno
      if (period === "MATTINO" && h === 13 && m > 45) continue;
      if (period === "POMERIGGIO" && h === 19 && m > 0) continue;

      const timeStr = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

      // Controllo orario passato (solo se la data scelta è oggi)
      if (day === todayStr) {
        const slotTime = new Date();
        slotTime.setHours(h, m, 0, 0);
        
        if (slotTime <= now) continue;
      }

      hours.push(timeStr);
    }
  }
  return hours;
};