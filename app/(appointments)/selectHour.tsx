import { Pressable, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ForwardedRef, forwardRef, JSX, useImperativeHandle } from "react";
import { styles } from "./styles";
import {
  Period,
  SelectHourProps,
  Service,
} from "../features/appointments/types";
import { generateSlots, getBlockedSlots } from "../services/helper";
import { ButtonConfirm } from "@/components/ui/button/ButtonConfirm";

export const SelectHour = forwardRef(
  (
    {
      service,
      period,
      selectedHour,
      bookedHours,
      day,
      onSelectService,
      onSelectPeriod,
      onSelectHour,
      onBackFromService,
      onBackFromPeriod,
      handleConfirm,
    }: SelectHourProps,
    ref: ForwardedRef<{ onBackFromPeriod: () => void }>
  ): JSX.Element => {
    const slots = generateSlots(period, day);

    const handleBackFromPeriod = () => {
      onBackFromPeriod();
    };

    useImperativeHandle(ref, () => ({
      onBackFromPeriod: handleBackFromPeriod,
    }));

    const blockedSlots = service ? getBlockedSlots(bookedHours, service) : [];

    return (
      <View style={styles.containerHour}>
        {/* STEP 1 — SERVIZIO */}
        {!service && (
          <View>
            {(["TAGLIO", "BARBA", "TAGLIO+BARBA"] as Service[]).map((s) => (
              <Pressable
                key={s}
                onPress={() => onSelectService(s)}
                style={styles.buttonHour}
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
                  style={styles.buttonHour}
                >
                  <ThemedText>{p}</ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* STEP 3 — ORARIO */}
        {service && period && (
          <View style={{ width: "100%" }}>
            {!selectedHour && (
              <Pressable onPress={onBackFromPeriod} style={styles.back}>
                <ThemedText>← Indietro</ThemedText>
              </Pressable>
            )}
            <View style={styles.hoursGrid}>
              {slots.map((hour) => {
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
          </View>
        )}

        {/* BOTTONE CONFERMA: appare solo se l'ora è selezionata */}
        {selectedHour && (
          <View
            style={[
              styles.confirmSectionInside,
              { flexDirection: "row", gap: 10, alignItems: "center" },
            ]}
          >
            <Pressable
              onPress={onBackFromPeriod}
              style={{ flex: 1, alignItems: "center" }}
            >
              <ThemedText>Annulla</ThemedText>
            </Pressable>

            <View style={{ flex: 2 }}>
              <ButtonConfirm onPress={handleConfirm} message="Conferma" />
            </View>
          </View>
        )}
      </View>
    );
  }
);
