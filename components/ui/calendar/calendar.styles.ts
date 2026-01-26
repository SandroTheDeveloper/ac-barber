import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    width: '100%', // Assicurati che prenda tutta la larghezza
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    // Opzionale: aggiungi un'ombra per farlo risaltare
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedInfo: {
    marginTop: 8,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16, // Ingrandisci anche l'etichetta sotto
  },
});
