import { StyleSheet } from "react-native";

const SignUpStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#7c7a7aff",
    justifyContent: "center", 
    alignItems: "center", 
  },
  welcome: {
    fontSize: 15,
    fontWeight: "600",
    color: "black",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  loginButton: {
    // backgroundColor: "#4DBF99",
    borderWidth: 1,              // thickness of the border
    borderColor: "black",        // color of the border
    borderRadius: 10,  
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
    marginLeft:20,
    marginRight:20,
  },
  loginText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
  rightBox: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    padding: 20,
    // borderTopLeftRadius: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    width: "90%",
    // marginLeft: 5,
    // marginRight: 5,
    marginTop: 50,
    marginBottom: 50,
    maxWidth: 400,
    alignSelf: 'center',
  },
  startText: {
    fontSize: 23,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 20,
  },
  createText: {
    fontSize: 25,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 50,
    marginBottom: 20,
    fontSize: 14,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  signUpButton: {
    backgroundColor: "#00CFFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  signUpButtonHover: {
    backgroundColor: "#dbd0d0",
    transform: [{ scale: 1.05 }],
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  signUpText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
});

export default SignUpStyles;
