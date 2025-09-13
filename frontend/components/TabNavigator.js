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
        tabBarStyle: { 
          backgroundColor: "#ffffffff", 
          height: 80, 
          // paddingTop: -10,
          // borderTopColor: "#e5e7eb", 
          // borderTopWidth: 3,
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
              color={focused ? "#8b5cf6" : "#d2bfff"} // purple active, gray inactive
              style={{ marginBottom: -10 , marginRight: -10}}
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
              color={focused ? "#10b981" : "#9de8cf"} // green active, gray inactive
              style={{ marginBottom: -10 , marginRight: -10}}
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
  width: 80, // bigger circle
  height: 80,
  borderRadius: 40, // half of width/height
  backgroundColor: "#6394ff",
  justifyContent: "center",
  alignItems: "center",
  elevation: 5,
}
});
