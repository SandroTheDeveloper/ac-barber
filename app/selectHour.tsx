import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ForwardedRef, forwardRef, JSX, useImperativeHandle } from "react";

export type Service = "TAGLIO" | "BARBA" | "TAGLIO+BARBA";
export type Period = "MATTINO" | "POMERIGGIO";

type SelectHourProps = {
  service: Service | null;
  period: Period | null;
  selectedHour?: string;
  bookedHours: string[];

  onSelectService: (service: Service) => void;
  onSelectPeriod: (period: Period) => void;
  onSelectHour: (hour: string) => void;

  onBackFromService: () => void;
  onBackFromPeriod: () => void;
  onBackFromHour: () => void;
};

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
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

const interval = 15;

const getBlockedSlots = (bookedHours: string[], service: Service): string[] => {
  const duration = getServiceDuration(service);
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

export const SelectHour = forwardRef(
  (
    {
      service,
      period,
      selectedHour,
      bookedHours,
      onSelectService,
      onSelectPeriod,
      onSelectHour,
      onBackFromService,
      onBackFromPeriod,
      onBackFromHour,
    }: SelectHourProps,
    ref: ForwardedRef<{ onBackFromPeriod: () => void }>
  ): JSX.Element => {
    const interval = 15;
    const CELL_SIZE = 70;

    const generateSlots = (): string[] => {
      if (!period) return [];

      const hours: string[] = [];
      const startHour = period === "MATTINO" ? 9 : 14;
      const endHour = period === "MATTINO" ? 13 : 19;

      for (let h = startHour; h <= endHour; h++) {
        for (let m = 0; m < 60; m += interval) {
          if (period === "MATTINO" && h === 13 && m > 45) continue;
          if (period === "POMERIGGIO" && h === 19 && m > 0) continue;

          hours.push(
            `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
          );
        }
      }
      return hours;
    };

    const slots = generateSlots();
    const rows: string[][] = [];
    for (let i = 0; i < slots.length; i += 5) {
      rows.push(slots.slice(i, i + 5));
    }

    const handleBackFromPeriod = () => {
      onBackFromPeriod();
    };

    useImperativeHandle(ref, () => ({
      onBackFromPeriod: handleBackFromPeriod,
    }));

    const blockedSlots = service ? getBlockedSlots(bookedHours, service) : [];

    return (
      <View style={styles.container}>
        {/* STEP 1 — SERVIZIO */}
        {!service && (
          <View>
            <Pressable onPress={onBackFromService} style={styles.back}>
              <ThemedText>← Indietro</ThemedText>
            </Pressable>

            {(["TAGLIO", "BARBA", "TAGLIO+BARBA"] as Service[]).map((s) => (
              <Pressable
                key={s}
                onPress={() => onSelectService(s)}
                style={styles.button}
              >
                <ThemedText>{s}</ThemedText>
              </Pressable>
            ))}
          </View>
        )}

        {/* STEP 2 — PERIODO */}
        {service && !period && (
          <View>
            <Pressable onPress={onBackFromService} style={styles.back}>
              <ThemedText>← Indietro</ThemedText>
            </Pressable>

            <View>
              {(["MATTINO", "POMERIGGIO"] as Period[]).map((p) => (
                <Pressable
                  key={p}
                  onPress={() => onSelectPeriod(p)}
                  style={styles.button}
                >
                  <ThemedText>{p}</ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* STEP 3 — ORARIO */}
        {service && period && (
          <View>
            {!selectedHour && (
              <Pressable onPress={onBackFromPeriod} style={styles.back}>
                <ThemedText>← Indietro</ThemedText>
              </Pressable>
            )}

            {rows.map((row) => (
              <View key={row.join("-")} style={styles.row}>
                {row.map((hour) => {
                  const isSelected = selectedHour === hour;
                  const isBooked = blockedSlots.includes(hour);
                  return (
                    <Pressable
                      key={hour}
                      disabled={isBooked}
                      onPress={() => onSelectHour(hour)}
                      style={[
                        styles.hour,
                        isSelected && styles.selected,
                        isBooked && styles.booked,
                      ]}
                    >
                      <ThemedText
                        style={[
                          isSelected && styles.selectedText,
                          isBooked && styles.bookedText,
                        ]}
                      >
                        {hour}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 12,
  },
  button: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    width: 200,
    height: 50,
    alignItems: "center",
  },
  back: { marginBottom: 12 },
  hour: {
    width: 70,
    height: 70,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  selected: { backgroundColor: "green", borderColor: "green" },
  selectedText: { color: "#fff" },
  booked: {
    backgroundColor: "#eee",
    borderColor: "#ccc",
    opacity: 0.5,
  },
  bookedText: {
    textDecorationLine: "line-through",
    color: "#999",
  },
});
