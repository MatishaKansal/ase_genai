import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  header: {
    // marginTop: 70,
    width: "100%",
    height: 60,
    backgroundColor: "#4DBF99",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    // elevation: 4,
    // shadowColor: "#000",
    // shadowOpacity: 0.2,
    // shadowOffset: { width: 0, height: 2 },
    // shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  backButton: {
    position: "absolute",
    left: 15,
  },
  backText: {
    fontSize: 20,
    color: "white",
  },
});

export default styles;

