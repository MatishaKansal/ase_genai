import { StyleSheet, Dimensions } from "react-native";

const { height, width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    // borderWidth: 2,
    // borderColor: "red",
    height: height,  
    width: width,     
  },
  content: {
    flex: 1,                 // baki ka space header ke neeche le lega
    justifyContent: "center", // vertical center
    alignItems: "center",     // horizontal center
    // marginTop: -150,
  },
  topbar: {
    width: "100%",
    height: 64,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 10,
  },
  topbarButton: {
    height: 50,
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "orange",
    borderRadius: 8,
    marginRight: 10,
  },
  search: {
    // borderWidth:2,
    alignSelf: "center",
    width: "100%",

    justifyContent: "center",
    alignItems: "center",

  },
  inner: {
    // backgroundColor: "#667579",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "95%", 
    maxWidth: 1000, 
    padding: 5,
    borderRadius: 10,

  },
  textarea: {
    flex: 1,
    height: 35,
    backgroundColor: "#d1d5db",
    color: "black",
    paddingLeft: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  switch: {
    marginLeft: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d1d5db",
    height: 35,
    width: 40,
    borderRadius: 5,
  },
  add: {
    marginRight: 5,
    justifyContent: "center",
    alignItems: "center",
    height: 35,
    width: 40,
    backgroundColor: "#d1d5db",
    borderRadius: 5,
  },
  below: {
    flex: 1,
    width: "100%",
    backgroundColor: "white",
  },
  hidden: {
    display: "none",
  },
});

export default styles;
