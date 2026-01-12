export type Appointment = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  service: string;
  status: string;
  client: {
    first_name: string;
    last_name: string;
    phone?: string;
  } | null;
};
