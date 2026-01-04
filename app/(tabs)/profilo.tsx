import { Image } from "expo-image";
import { Platform, Pressable, StyleSheet, View } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link, useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function MyProfile() {
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
        onPress={() => router.push("/prenotazioni")}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  button: {
    backgroundColor: "blue",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
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
