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
