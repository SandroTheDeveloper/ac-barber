import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
//   calendarContainer: {
//     marginVertical: 16,
//   },
  container: { flex: 1, padding: 20 },

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

  buttonCancel: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 40,
    color: "black",
  },

  search: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginVertical: 12,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  name: {
    fontSize: 16,
    marginBottom: 4,
  },

  meta: {
    fontSize: 14,
    opacity: 0.8,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 10,
  },

  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },

  editBtn: {
    borderColor: "#888",
  },

  deleteBtn: {
    borderColor: "red",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  pageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: "#555",
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },

  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#888",
  },

  filterButtonActive: {
    backgroundColor: "green",
    borderColor: "green",
  },

  filterTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  disabledBtn: {
    opacity: 0.5,
    backgroundColor: "#f5f5f5",
  },
  
  summary: {
    marginTop: 8,
    fontSize: 16,
  },

    containerHour: {
    marginTop: 20,
    alignSelf: "center",
  },
  rowHour: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 12,
  },
  buttonHour: {
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
