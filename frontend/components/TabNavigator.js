import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Chat from "../screens/Chat/Chat";
import Profile from "../screens/Profile/Profile";  
import Camera from "../screens/CameraScreen/CameraScreen";         

const Tab = createBottomTabNavigator();

// Custom floating button
function CameraButton({ children, onPress }) {
  return (
    <TouchableOpacity
      style={styles.cameraButton}
      onPress={onPress}
    >
      <View style={styles.innerCircle}>{children}</View>
    </TouchableOpacity>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Profile"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { backgroundColor: "white", height: 60 },
      }}
    >
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle-outline" size={40} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Camera"
        component={Camera}
        options={{
          tabBarButton: (props) => (
            <CameraButton {...props}>
              <Ionicons name="camera" size={40} color="black" />
            </CameraButton>
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={Chat}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={40}
              color={color}
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
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});