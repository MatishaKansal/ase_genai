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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { lightTheme, darkTheme } from "../../components/theme";
import { createStyles } from "./ProfileStyles";
import baseUrl from "../../url";


const { height, width } = Dimensions.get("window");

const Profile = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [info, setInfo] = useState([]);
  const [userData, setUserData] = useState({});
  const [hoverIndex, setHoverIndex] = useState(null);

  const theme = darkMode ? darkTheme : lightTheme;
  const styles = createStyles(theme);
  const navigation = useNavigation();

  // Load saved theme from AsyncStorage
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem("darkMode");
      if (savedTheme !== null) setDarkMode(JSON.parse(savedTheme));
    };
    loadTheme();
  }, []);

  // Save theme changes to AsyncStorage
  useEffect(() => {
    AsyncStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const fetchData = async () => {
    try {
      const user = await AsyncStorage.getItem("user");
      if (!user) return;

      const parsedUser = JSON.parse(user);
      setUserData(parsedUser);

      const { userId } = parsedUser;
      const res = await axios.get(`${baseUrl}/api/chat/${userId}`);
      setInfo(res.data);
    } catch (err) {
      console.log("Error fetching notebooks:", err.message);
    }
  };

  // Refresh data when screen focuses
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
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
      <SafeAreaView style={{ backgroundColor: theme.topbar }}>
        <View style={styles.top}>
          <View style={styles.profile}>
            <Image source={userData.profilePic} style={styles.avatar} />
            <Text style={styles.profileName}>
              Welcome {userData.userName || "GEN AI"} !!
            </Text>
          </View>

          {/* Dark/Light Mode Toggle */}
          <View style={styles.mode_container}>
            <TouchableOpacity onPress={() => setDarkMode(!darkMode)}>
              <Ionicons
                name={darkMode ? "sunny" : "moon"}
                size={32}
                color={darkMode ? "#BEBEBE" : "#fff"}
              />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <View style={styles.settings_container}>
            <TouchableOpacity onPress={handleLogout}>
              <Text
                style={{
                  color: "#00CFFF",
                  fontSize: 20,
                  fontWeight: "700",
                }}
              >
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
          <Text style={{ color: theme.text }}>No History Available...</Text>
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
                  colors={[theme.cardTop, theme.cardTop + "80"]}
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
