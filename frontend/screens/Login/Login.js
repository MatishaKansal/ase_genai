import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useWindowDimensions } from "react-native";
import styles from "./LoginStyles";
import Header from "../../components/Header";

const baseUrl = "https://4ca393730fae.ngrok-free.app";

export default function Login() {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  // Update form values
  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle login
  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${baseUrl}/auth/login`, formData);
      console.log("Full response:", response.data);

      const token = response.data?.token;
      if (token) {
        // store token + user in AsyncStorage
        await AsyncStorage.setItem("token", token);
        if (response.data.user) {
          await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
        }

        Alert.alert("Success", "Login successful!");
        setMessage("");
        navigation.navigate("ChatTabs"); // 👈 change to your main screen name
      } else {
        Alert.alert("Error", "Login failed: Token not received");
      }
    } catch (error) {
      console.error(error.response?.data || "Login failed");
      setMessage("Login failed. Please check your credentials.");
      Alert.alert("Error", "Login failed. Please try again.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <View
        style={[
          styles.container,
          { flexDirection: width > 768 ? "row" : "column" },
        ]}
      >
        <View style={styles.box}>
          <Text style={styles.startText}>Welcome back !!</Text>
          <Text style={styles.createText}>Login</Text>

          <TextInput
            placeholder="Email Address"
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => handleChange("email", text)}
          />

          <TextInput
            placeholder="Password"
            secureTextEntry
            style={styles.input}
            value={formData.password}
            onChangeText={(text) => handleChange("password", text)}
          />

          {message ? <Text style={styles.error}>{message}</Text> : null}

          <TouchableOpacity style={styles.signUpButton}
            // onPress={() => navigation.navigate("ChatTabs")} 
          onPress={handleSubmit}
          >
            <Text style={styles.signUpText}>Login</Text>
          </TouchableOpacity>

          <Text style={styles.welcome}>New to the app?</Text>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text style={styles.loginText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
