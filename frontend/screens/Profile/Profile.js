import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Platform,
  FlatList,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./ProfileStyles";
import { useNavigation } from "@react-navigation/native";

const { height, width } = Dimensions.get("window");

const Profile = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [info, setInfo] = useState([]);
  const [userData, setUserData] = useState({});
  const [hoverIndex, setHoverIndex] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await AsyncStorage.getItem("user");
        if (user) setUserData(JSON.parse(user));

        // Dummy data for now
        setInfo([
          { heading: "Chat 1 gggggggggggg", data: "Some chat history text ..." },
          { heading: "Chat 2", data: "More chat history here" },
          { heading: "Chat 3", data: "More chat history here" },
          { heading: "Chat 4", data: "More chat history here" },
          { heading: "Chat 5", data: "More chat history here" },
          { heading: "Chat 6", data: "More chat history here" },
          { heading: "Chat 7", data: "More chat history here" },
          { heading: "Chat 8", data: "More chat history here" },
        ]);
      } catch (err) {
        console.log("Error:", err);
      }
    };
    fetchData();
  }, []);


  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["token", "user"]);
      console.log("Logged out successfully");

      // 👇 pura stack reset hoga aur Home pe redirect karega
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch (error) {
      console.log("Logout error:", error);
    }
  };


  return (
    <View style={styles.container}>

      {/* Full-screen overlay: shown only when dropdownOpen.
          It catches taps anywhere and closes the dropdown.
          overlay zIndex must be lower than dropdown's zIndex so dropdown is clickable. */}
      {dropdownOpen && (
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            // semi-transparent background helps debugging; set to 'transparent' if you prefer
            backgroundColor: "rgba(0,0,0,0.0)",
            zIndex: 1,
          }}
          onPress={() => setDropdownOpen(false)}
        />
      )}


      <SafeAreaView style={{ backgroundColor: "#1f2937" }}>
        {/* Header Section */}
        <View style={styles.top}>
          <View style={styles.profile}>
            <Image
              source={{ uri: "https://www.w3schools.com/howto/img_avatar.png" }}
              style={styles.avatar}
            />
            <Text style={styles.profileName}>
              Welcome {userData.userName || "GEN AI"} !!
            </Text>
          </View>

          <View style={styles.settings_container}>
            <TouchableOpacity onPress={(e) => {
              e.stopPropagation();
              setDropdownOpen(!dropdownOpen);
            }}>
              <Ionicons name="settings-outline" size={34} color="white" />
            </TouchableOpacity>

            {dropdownOpen && (
              <View style={styles.dropdown}>
                {/* Edit Profile */}
                <TouchableOpacity
                  onPress={() => console.log("Edit Profile pressed")}
                  style={[
                    styles.dropdown_item,
                    Platform.OS === "web" ? { cursor: "pointer" } : {},
                  ]}
                >
                  <Text style={styles.dropdown_text}>Edit Profile</Text>
                </TouchableOpacity>

                {/* Change Password */}
                <TouchableOpacity
                  onPress={() => console.log("Change Password pressed")}
                  style={[
                    styles.dropdown_item,
                    Platform.OS === "web" ? { cursor: "pointer" } : {},
                  ]}
                >
                  <Text style={styles.dropdown_text}>Change Password</Text>
                </TouchableOpacity>

                {/* Logout with borderTop as divider */}
                <TouchableOpacity
                  onPress={handleLogout}
                  style={[
                    styles.dropdown_item,
                    { borderTopWidth: 1, borderTopColor: "#c8c6c6" },
                    Platform.OS === "web" ? { cursor: "pointer" } : {},
                  ]}
                >
                  <Text style={styles.dropdown_text}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* Chat History Section */}
      <View style={[styles.history, { flex: 1 }]}>
        <Text style={styles.historyHeading}>HISTORY</Text>

        {info.length === 0 ? (
          <Text style={styles.null_message}>No History Available.....</Text>
        ) : (
          <FlatList
            data={info}
            keyExtractor={(item, index) => index.toString()}
            numColumns={Platform.OS === "web" ? 3 : 1} // 3 per row on web, 1 per row on mobile
            showsVerticalScrollIndicator={true} // 👈 scroll bar dikhane ke liye
            contentContainerStyle={[
              styles.historySection,
              { paddingBottom: 100 }, // tab navigator ke liye space
            ]}
            style={[styles.flat_list, { flex: 1 }]}
            renderItem={({ item, index }) => (
              <View
                style={[
                  styles.historyCard,
                  Platform.OS === "web" &&
                  hoverIndex === index &&
                  styles.historyCardHovered,
                ]}
                onMouseEnter={() =>
                  Platform.OS === "web" && setHoverIndex(index)
                }
                onMouseLeave={() =>
                  Platform.OS === "web" && setHoverIndex(null)
                }
              >
                <LinearGradient
                  colors={[
                    "rgba(31, 41, 55, 0.6)",
                    "rgba(55, 65, 81, 0.4)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.historyCardTop}
                >
                  <Text
                    style={styles.cardTitle}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.heading}
                  </Text>
                </LinearGradient>

                <Text
                  style={styles.historyCardBottom}
                  numberOfLines={3}
                  ellipsizeMode="tail"
                >
                  {item.data}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

export default Profile;