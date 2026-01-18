import ParallaxScrollView from "@/components/parallax-scroll-view";
import { Stack, useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { styles } from "./styles";
import { ButtonDefault } from "@/components/ui/button/ButtonDefault";

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
      <Stack.Screen
        options={{
          title: "Mio Profilo",
          headerBackTitle: "Indietro", // iOS
        }}
      />
      <ButtonDefault
        onPress={() => router.push("/(appointments)/my-appointment")}
        message="Le mie prenotazioni"
      ></ButtonDefault>

      <ButtonDefault
        onPress={() => router.push("/reset-password")}
        message="Reset password"
      ></ButtonDefault>
    </ParallaxScrollView>
  );
}
