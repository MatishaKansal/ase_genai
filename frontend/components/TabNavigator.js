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
    <TouchableOpacity style={styles.cameraButton} onPress={onPress}>
      <View style={styles.innerCircle}>{children}</View>
    </TouchableOpacity>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Chat"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { backgroundColor: "white", height: 70, paddingTop: 10 },
      }}
    >
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: () => (
            <Ionicons name="person-circle-outline" size={40} color="black" />
          ),
        }}
      />

      <Tab.Screen
        name="Camera"
        component={Camera}
        options={{
          // 👇 Important: Camera screen fresh mount/unmount for direct load
          unmountOnBlur: true,
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
          tabBarIcon: () => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={40}
              color="black"
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
    backgroundColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
