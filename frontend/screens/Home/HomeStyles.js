import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(223,223,223)",
  },

  // Navbar
  navbar: {
    height: 64, // 4rem ≈ 64px
    backgroundColor: "#151C24",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    color: "#f59e0b",
    fontSize: 30, // 3rem ≈ 30px
    marginLeft: 20,
    backgroundColor: "#151C24",
    textDecorationLine: "none",
  },
  loginButton: {
    backgroundColor: "#f59e0b",
    height: 50,
    width: 200,
    marginRight: 20,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },

  // Hero section
  heroTitle: {
    // borderWidth:2,
    textAlign:"center",
    marginTop: 70,
    marginLeft: 50,
    marginRight: 50,
    fontSize: 30,
    fontWeight: "bold",
  },
  heroSubtitle: {
    marginTop: 30,
    textAlign:"center",
    marginLeft: 50,
    marginRight: 50,
    fontSize: 20, // 2rem ≈ 20px
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
    maxWidth:400,
    borderRadius: 50,
    backgroundColor: "white",
    alignItems: "center",
    padding: 20,
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
    // borderWidth: 2,
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
    textAlign:"center",
    marginLeft:15,
    marginRight:15,
  },
  footerButton: {
    backgroundColor: "#f59e0b",
    height: 70,
    width: 200,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  footerButtonText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
});

export default styles;