import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import SignUp from "./screens/SignUp/SignUp";
import Login from "./screens/Login/Login";
import Home from "./screens/Home/Home";
import TabNavigator from "./components/TabNavigator";
import AuthLoading from "./screens/AuthLoading/AuthLoading";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* 👇 Sabse pehle AuthLoading chalega */}
        <Stack.Screen name="AuthLoading" component={AuthLoading} />

        {/* Agar token nahi hai toh ye screens accessible honge */}
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={SignUp} />

        {/* Agar token hai toh direct yaha bhej do */}
        <Stack.Screen name="ChatTabs" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
