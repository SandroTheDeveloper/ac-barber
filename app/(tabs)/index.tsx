import { Image } from "expo-image";
import { Platform } from "react-native";
import { useEffect, useState } from "react";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { supabase } from "../services/supabase";
import { styles } from "./styles";

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
    </ParallaxScrollView>
  );
}
