import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function AuthLoading() {
  const navigation = useNavigation();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // ✅ token check
        const token = await AsyncStorage.getItem("token");

        if (token) {
          // Agar token hai → ChatTabs
          navigation.reset({
            index: 0,
            routes: [{ name: "ChatTabs" }],
          });
        } else {
          // Agar token nahi hai → Login
          navigation.reset({
            index: 0,
            routes: [{ name: "Home" }],
          });
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      }
    };

    checkLoginStatus();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#f59e0b" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111827", // 👈 thoda dark background
  },
});
