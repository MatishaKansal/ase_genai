import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  }, 
  navbar: {
    height: 70,
    backgroundColor: "#151C24",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15, // thoda spacing
  },

  logoContainer: {
    flexDirection: "row",   // logo aur text ek line me
    alignItems: "center",
    backgroundColor: "#151C24",
  },

  logo: {
    width: 120, 
    height: 60,
    marginRight: 8, // logo aur text ke beech gap
    backgroundColor: "#151C24",
  },

  headerTitle: {
    fontSize: 30,
    marginLeft: -10,
    fontWeight: "bold",
    color: "#ffff", // brand orange
    fontFamily: "vintage-regular",
  },
  loginButton: {
    backgroundColor: "#3ba46cff",
    height: 50,
    width: 200,
    marginRight: 20,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  // Hero section
  heroTitle: {
    textAlign: "center",
    marginTop: 70,
    marginLeft: 50,
    marginRight: 50,
    fontSize: 40,
    fontWeight: "bold",
  },
  heroSubtitle: {
    marginTop: 30,
    textAlign: "center",
    marginLeft: 50,
    marginRight: 50,
    fontSize: 22,
    color: "#333",
  },

  // Content
  content: {
    marginTop: 100,
    minHeight: 700,
    width: "100%",
    backgroundColor: "rgb(236,234,234)",
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    paddingBottom: 50,
  },
  contentBox: {
    marginTop: 100,
    height: 350,
    width: "90%",
    maxWidth: 400,
    borderRadius: 50,
    backgroundColor: "#EDF2F7",
    alignItems: "center",
    padding: 20,
    transitionDuration: "0.3s",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 2, height: 4 },
    shadowRadius: 6,
  },
  contentBoxHover: {
    backgroundColor: "#dbd0d0",
    transform: [{ scale: 1.05 }],
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  boxIcon: {
    fontSize: 50,
    marginTop: 5,
  },
  boxTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 50,
    textAlign: "center",
  },
  boxText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 30,
    textAlign: "center",
    width: "90%",
  },

  // Footer
  footer: {
    height: 500,
    backgroundColor: "#151C24",
    justifyContent: "center",
    alignItems: "center",
  },
  footerTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  footerSubtitle: {
    fontSize: 18,
    color: "white",
    marginBottom: 30,
    textAlign: "center",
    marginLeft: 15,
    marginRight: 15,
  },
  footerButton: {
    backgroundColor: "#38A169",
    height: 70,
    width: 200,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    transitionDuration: "0.3s",
  },
  footerButtonText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
});

export default styles;
