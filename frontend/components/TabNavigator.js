import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Chat from "../screens/Chat/Chat";
import Profile from "../screens/Profile/Profile";  
import Camera from "../screens/CameraScreen/CameraScreen";         
import { lightTheme, darkTheme } from "../components/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Tab = createBottomTabNavigator();

// Custom floating button
function CameraButton({ children, onPress }) {
  return (
    <TouchableOpacity style={styles.cameraButton} onPress={onPress}>
      <View style={styles.innerCircle}>{children}</View>
    </TouchableOpacity>
  );
}

export default function TabNavigator() {
  const [darkMode, setDarkMode] = useState(false);

  // Load theme from AsyncStorage
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem("darkMode");
      if (savedTheme !== null) setDarkMode(JSON.parse(savedTheme));
    };
    loadTheme();
  }, []);

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <Tab.Navigator
      initialRouteName="Chat"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { 
          backgroundColor: theme.topBar, // ✅ theme-aware background
          height: 80, 
        },
      }}
    >
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="person-circle-outline"
              size={40}
              color={focused ? theme.primary : theme.inactive} // theme colors
              style={{ marginBottom: -10 , marginRight: -10 }}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Camera"
        component={Camera}
        options={{
          unmountOnBlur: true,
          tabBarButton: (props) => (
            <CameraButton {...props}>
              <Ionicons name="camera" size={40} color="#ffffff" /> 
            </CameraButton>
          ),
        }}
      />

      <Tab.Screen
        name="Chat"
        component={Chat}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={40}
              color={focused ? theme.primary : theme.inactive} // theme-aware
              style={{ marginBottom: -10 , marginRight: -10 }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  cameraButton: {
    top: -20, // floating effect
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 80, 
    height: 80,
    borderRadius: 40, 
    backgroundColor: "#00CFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  }
});