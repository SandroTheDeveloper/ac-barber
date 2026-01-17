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
