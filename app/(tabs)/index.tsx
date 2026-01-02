import { Image } from "expo-image";
import { Platform, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabase";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";

export default function HomeScreen() {
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    const loadClient = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("clients")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();

      if (data) {
        setFullName(`${data.first_name} ${data.last_name}`);
      }
    };

    loadClient();
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">
          {fullName ? `Ciao ${fullName}` : "Ciao 👋"}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Titolo 1</ThemedText>
        <ThemedText type="defaultSemiBold">
          {Platform.select({
            ios: "cmd + d",
            android: "cmd + m",
            web: "F12",
          })}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">
              Titolo 2: clicca e appare la Modale
            </ThemedText>
          </Link.Trigger>
        </Link>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
