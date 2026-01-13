import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
//   calendarContainer: {
//     marginVertical: 16,
//   },
  selectedInfo: {
    marginTop: 12,
    fontSize: 14,
  },

  createAppContainer: { flex: 1, padding: 20 },

  label: { marginTop: 12, marginBottom: 4 },

  input: {
    borderWidth: 1,
    borderColor: "#888",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    maxHeight: 220,
    marginBottom: 12,
    backgroundColor: "#fff",
    zIndex: 2,
  },

  dropdownHour: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    maxHeight: 300,
    marginBottom: 12,
    backgroundColor: "#fff",
    zIndex: 2,
  },

  search: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  option: {
    padding: 10,
  },

  disabledOption: {
    backgroundColor: "#f5f5f5",
    opacity: 0.5,
  },

  disabledText: {
    textDecorationLine: "line-through",
    color: "#999",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  calendarContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    width: "90%",
  },

  button: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 40,
  },

  container: { flex: 1, padding: 20 },

});
