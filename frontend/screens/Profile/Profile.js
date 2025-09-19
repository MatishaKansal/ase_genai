import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  Platform,
  FlatList,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./ProfileStyles";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import axios from "axios";

const baseUrl = "http://localhost:5000";

const { height, width } = Dimensions.get("window");

const Profile = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [info, setInfo] = useState([]);
  const [userData, setUserData] = useState({});
  const [hoverIndex, setHoverIndex] = useState(null);

  const navigation = useNavigation();

  const fetchData = async () => {
    try {
      const user = await AsyncStorage.getItem("user");
      if (!user) return;

      const parsedUser = JSON.parse(user);
      setUserData(parsedUser);

      const { userId } = parsedUser;

      const res = await axios.get(`${baseUrl}/api/chat/${userId}`);

      console.log("Notebooks data:", res.data);
      setInfo(res.data);
    } catch (err) {
      console.log("Error fetching notebooks:", err.message);
    }
  };

  // ✅ useFocusEffect se har tab change pe refresh hoga
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      console.log("Logged out successfully");

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
      <SafeAreaView style={{ backgroundColor: "#1f2937"}}>
        <View style={styles.top}>
          <View style={styles.profile}>
            <Image
              source={userData.profilePic}
              style={styles.avatar}
            />
            <Text style={styles.profileName}>
              Welcome {userData.userName || "GEN AI"} !!
            </Text>
          </View>

          <View style={styles.settings_container}>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={{ color: "#F59E0B", fontSize: 20, fontWeight: "700" }}>
                Logout
              </Text>
            </TouchableOpacity>
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
            numColumns={Platform.OS === "web" ? 3 : 1}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={[
              styles.historySection,
              { paddingBottom: 100 },
            ]}
            style={[styles.flat_list, { flex: 1 }]}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.historyCard,
                  Platform.OS === "web" &&
                    hoverIndex === index &&
                    styles.historyCardHovered,
                ]}
                onPress={() => 
                  // console.log(item.notebookId)
                  navigation.navigate("Chat", { notebookId: item.notebookId })
                }
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
                    {item.title}
                  </Text>
                </LinearGradient>

                <Text
                  style={styles.historyCardBottom}
                  numberOfLines={3}
                  ellipsizeMode="tail"
                >
                  {item.preview}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
};

export default Profile;
