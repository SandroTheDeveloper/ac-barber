import { LocaleConfig } from "react-native-calendars";
import { Service } from "../features/appointments/types";

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

// ✅ Configurazione italiana del calendario
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
