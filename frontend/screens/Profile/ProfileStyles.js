import { StyleSheet, Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
        paddingBottom: 60, // niche tab navigator ke liye jagah
    },
    top: {
        width: "100%",
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderBottomWidth: 2,
        borderBottomColor: "#ddd",
        height: 60,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1f2937",
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
    settings_container: {
        position: "relative",
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
        zIndex: 200,
    },
    dropdown_item: {
        padding: 10,
        cursor: Platform.OS === "web" ? "pointer" : "default",
    },
    hr: {
        height: 1,
        backgroundColor: "#c8c6c6",
        marginVertical: 4,
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
        color: "#f59e0b",
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
        height: 200,
        backgroundColor: "white",
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
        backgroundColor: "rgba(31, 41, 55, 0.7)",
        borderRadius: 10,
        justifyContent: "center",
        paddingHorizontal: 5,
        overflow: "hidden",
    },
    cardTitle: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
        overflow: "hidden",
    },
    historyCardBottom: {
        flex: 1,
        padding: 10,
        color: "#1f2937",
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

export default styles;
