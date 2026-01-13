import { Pressable } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { styles } from "./styles";

export default function MioProfilo() {
  const router = useRouter();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        dark: "#353636",
        light: "#D0D0D0",
      }}
      headerImage={
        <IconSymbol
          size={100}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.reactLogo}
        />
      }
    >
      <Pressable
        style={[styles.button]}
        onPress={() => router.push("/(appointments)/my-appointment")}
      >
        <ThemedText>Le mie prenotazioni</ThemedText>
      </Pressable>

      <Pressable
        style={[styles.button]}
        onPress={() => router.push("/reset-password")}
      >
        <ThemedText>Reset password</ThemedText>
      </Pressable>
    </ParallaxScrollView>
  );
}
