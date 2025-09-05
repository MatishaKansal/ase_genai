import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useWindowDimensions } from "react-native";
import styles from "./SignUpStyles";
import Header from "../../components/Header";

const baseUrl = "http://localhost:5000"; // 👈 replace with your backend IP

export default function SignUp() {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const [message, setMessage] = useState("");

  // Handle input changes
  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle signup
  const handleSubmit = async () => {
    try {
      const res = await axios.post(`${baseUrl}/api/auth/register`, {
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });

      const token = res.data?.token;
      if (token) {
        // Save token in AsyncStorage
        await AsyncStorage.setItem("token", token);

        Alert.alert("Success", "Signed up successfully!");
        setMessage("");
        navigation.navigate("Login"); // 👈 after signup go to login screen
      }
    } catch (error) {
      console.log(error.response?.data || error.message);
      setMessage("Signup failed. Try again.");
      Alert.alert("Error", "Signup failed. Please check your details.");
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
        <View style={styles.rightBox}>
          <Text style={styles.startText}>Start now !!</Text>
          <Text style={styles.createText}>Create Account</Text>

          <TextInput
            placeholder="Email Address"
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => handleChange("email", text)}
          />

          <TextInput
            placeholder="Username"
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => handleChange("name", text)}
          />

          <TextInput
            placeholder="Password"
            secureTextEntry
            style={styles.input}
            value={formData.password}
            onChangeText={(text) => handleChange("password", text)}
          />

          {message ? <Text style={styles.error}>{message}</Text> : null}

          <TouchableOpacity style={styles.signUpButton} onPress={handleSubmit}>
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>

          <Text style={styles.welcome}>Already Have An Account?</Text>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
