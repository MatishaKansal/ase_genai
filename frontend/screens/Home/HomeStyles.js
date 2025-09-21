import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#282828ff",
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
    backgroundColor: "#00CFFF",
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
    color: 'white',
    fontWeight: "bold",
    textShadowColor: 'rgba(0, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  heroSubtitle: {
    marginTop: 30,
    textAlign: "center",
    marginLeft: 50,
    marginRight: 50,
    fontSize: 22,
    color: "#00CFFF",
  },

  // Content
  content: {
    marginTop: 100,
    minHeight: 700,
    width: "100%",
    backgroundColor: "#282828ff",
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
    backgroundColor: "#0B1E33",
    alignItems: "center",
    padding: 20,
    transitionDuration: "0.3s",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 2, height: 4 },
    shadowRadius: 6,
  },
  contentBoxHover: {
    backgroundColor: "#76a1b4ff",
    transform: [{ scale: 1.05 }],
    shadowColor: '#00CFFF',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
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
    color:"#fff",
  },
  boxText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 30,
    textAlign: "center",
    width: "90%",
    color:"#fff",
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
    textShadowColor: 'rgba(0, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  footerSubtitle: {
    fontSize: 18,
    color: "white",
    marginBottom: 30,
    textAlign: "center",
    marginLeft: 15,
    marginRight: 15,
    textShadowColor: 'rgba(0, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  footerButton: {
    backgroundColor: "#00CFFF",
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
