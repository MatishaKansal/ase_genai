import { StyleSheet, Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

export const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingBottom: 60, // niche tab navigator ke liye jagah
    },  
    top: {
        width: "100%",
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderBottomWidth: 2,
        // borderBottomColor: "#ddd",
        height: 60,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#3b3b3bff",
        // borderWidth: 2,
        // borderColor: "white",
    },
    profile: {
        flexDirection: "row",
        alignItems: "center",
        gap: width * 0.01,
        // marginLeft: "auto",
    },
    avatar: {
        height: 50,
        width: 50,
        borderRadius: 35,
        borderWidth: 3,
        borderColor: "#ccc",
    },
    profileName: {
        fontSize: 20,
        fontWeight: "600",
        color: "white",
    },
    mode_container: {
        // borderWidth: 2,
        // borderColor: "#F59E0B",
        // alignContent: "right",
        position: "relative",
        marginLeft: 1100,
        zIndex: 200,
    },
    settings_container: {
        position: "relative",
        zIndex: 300,
    },
    dropdown: {
    position: "absolute",
    right: 0,
    top: 40,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 160,
    zIndex: 9999,  // sabse upar
    },
    dropdown_item: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        // borderWidth: 0,
    },
    hr: {
    height: 1,
    backgroundColor: "#c8c6c6",
    alignSelf: "stretch",   // bas apne container tak
    marginVertical: 4,
    zIndex: -1,             // hr ko click ke upar na laye

    },
    history: {
        marginTop: 50,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: -60,
    },
    historyHeading: {
        fontSize: 48,
        fontWeight: "bold",
        color: theme.heading,
        fontSize: 40,
        fontWeight: 'bold',
        // color: 'white',
        textShadowColor: theme.headingbackground,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    scrollContainer: {
        flex: 1,
        width: "100%",
        ...Platform.select({
            web: {
                overflowY: "auto",
            },
        }),
    },
    historySection: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between", // 3 per row on web
        width: "90%",
        // height: "100%",
        alignSelf: "center",
        paddingVertical: 20,
        gap: 20,
        // borderWidth: 3,
    },
    historyCard: {
        width: Platform.OS === "web" ? "30%" : "45%", // web: 3 cards per row, mobile: 2 per row
        width: 200,
        color:"#CFCFCF",
        height: 200,
        backgroundColor: theme.cardBackground,
        borderRadius: 10,
        padding: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 3, height: 6 },
        shadowRadius: 4,
        transform: [{ scale: 1 }],
        marginBottom: 15,
        ...Platform.select({
            web: { transitionDuration: "300ms" },
        }),
        marginLeft: 15,
        marginRight:15,
        justifyContent: "center",

    },
    historyCardHovered: {
        ...Platform.select({
            web: {
                transform: [{ scale: 1.05 }],
                shadowColor: "#6b7280",
                shadowOpacity: 0.4,
                shadowOffset: { width: 0, height: 8 },
                shadowRadius: 20,
                cursor: "pointer",
            },
        }),
    },
    historyCardTop: {
        height: height * 0.06,
        backgroundColor: theme.cardTop,
        borderRadius: 10,
        color: "#CFCFCF",
        alignItems: "center" ,
        justifyContent: "center",
        paddingHorizontal: 5,
        overflow: "hidden",
    },
    cardTitle: {
        color: "white",
        fontWeight: "bold",
        fontSize: 22,
        overflow: "hidden",
    },
    historyCardBottom: {
        flex: 1,
        padding: 10,
        color: theme.text,
        opacity: 0.8,
        overflow: "hidden",
    },
    flat_list:{
        flex: 1, 
        maxHeight: "100%",
        width : "70%",
        maxWidth: 750,
        // justifyContent: "center",
    }
});

export default createStyles;
