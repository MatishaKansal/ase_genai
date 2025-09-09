import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Platform,
  FlatList,
  Dimensions,
  SafeAreaView,
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
            <Pressable onPress={() => setDropdownOpen(!dropdownOpen)}>
              <Ionicons name="settings-outline" size={34} color="white" />
            </Pressable>

            {dropdownOpen && (
              <View style={styles.dropdown}>
                <Text
                    style={[
                    styles.dropdown_item,
                    Platform.OS === "web" ? { cursor: "pointer" } : {},
                    ]}
                >
                    Edit Profile
                </Text>
                <Text
                    style={[
                    styles.dropdown_item,
                    Platform.OS === "web" ? { cursor: "pointer" } : {},
                    ]}
                >
                    Change Password
                </Text>
                {/* <View style={styles.hr} /> */}
                <Pressable
                    onPress={handleLogout}
                    style={Platform.OS === "web" ? { cursor: "pointer" } : {}}
                >
                    <Text
                    style={[
                        styles.dropdown_item,
                        Platform.OS === "web" ? { cursor: "pointer" } : {},
                    ]}
                    >
                    Logout
                    </Text>
                </Pressable>
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
