import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  header: {
    width: "100%",
    height: 60,
    backgroundColor: "#151C24",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    marginTop: -5,
    width: 120,
    height: 60,
    marginRight: -10,
    borderRadius: 18,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "vintage-regular",
    fontWeight: "500",
  },
});

export default styles;
