import { StyleSheet, Dimensions } from "react-native";

const { height, width } = Dimensions.get("window");

const styles = StyleSheet.create({
  chatArea: {
    flex: 1,
    padding: 10
  },
  messageBubble: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: "70%"
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6"
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#EAEAEA"
  },
  messageText: {
    fontSize: 16,
    color: "black"
  },
  fileContainer: {
    marginTop: 5,
    padding: 5,
    backgroundColor: "#ddd",
    borderRadius: 5
  },
  fileLink: {
    color: "blue",
    textDecorationLine: "underline"
  },
  fileImage: {
    width: 120,
    height: 120,
    borderRadius: 8
  },
  container: {
    flex: 1,
    height: height,
    width: width,
  },
  content: {
    flex: 1,                
    justifyContent: "center", 
    alignItems: "center",    
  },
  topbar: {
    width: "100%",
    height: 64,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 10,
    // borderRadius: 20,
  },
  topbarButton: {
    height: 50,
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "orange",
    borderRadius: 30,
    marginRight: 10,
  },
  bottomContainer: {
    width: "100%",
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingBottom: 5,
    alignSelf: "center",
    width: "100%",

    justifyContent: "center",
    alignItems: "center",
  },

  previewContainer: {
    flexDirection: "row",
    padding: 5,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    maxHeight: 80,
  },
  fileBox: {
    marginRight: 8,
    position: "relative",
    backgroundColor: "#f1f1f1",
    padding: 5,
    marginRight: 8,
    borderRadius: 5,
    minWidth: 80,
    maxWidth: 120,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "#ddd",
  },

  removeBtn: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 5,
  },
  fileName: {
    fontSize: 12,
    color: "black",
  },
  chatArea: {
    flex: 1,
    backgroundColor: "white",
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
    // minHeight: 20,  
    // 1-line starting height
    // no fixed height here; we control via inline {height: inputHeight}
    backgroundColor: "#d1d5db",
    color: "black",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    fontSize: 16,
    lineHeight: 25,         // helps keep line calc stable
    textAlignVertical: "top",
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
