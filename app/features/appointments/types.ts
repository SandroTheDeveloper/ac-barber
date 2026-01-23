export type Appointment = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  service: Service;
  status: string;
  client: {
    first_name: string;
    last_name: string;
    phone?: string;
  } | null;
};

export type Service = "TAGLIO" | "BARBA" | "TAGLIO+BARBA";

export type Period = "MATTINO" | "POMERIGGIO";

export type DateFilter = "TODAY" | "DATE" | "PAST" | "ALL";

export type SelectHourProps = {
  service: Service | null;
  period: Period | null;
  selectedHour?: string;
  bookedHours: string[];
  day: string;

  onSelectService: (service: Service) => void;
  onSelectPeriod: (period: Period) => void;
  onSelectHour: (hour: string) => void;

  onBackFromService: () => void;
  onBackFromPeriod: () => void;
  onBackFromHour: () => void;
  handleConfirm: () => void;
};