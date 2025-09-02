import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./SignUpStyles";
import { useWindowDimensions } from "react-native";
import Header from "../../components/Header";


const baseUrl = "http://192.168.X.X:5000";

export default function SignUp() {

  const { width } = useWindowDimensions();


  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(`${baseUrl}/api/auth/register`, {
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });

      const token = res.data?.token;
      if (token) {
        await AsyncStorage.setItem("token", token);
        Alert.alert("Success", "Signed up successfully!");
        setMessage("");
        navigation.navigate("Login");
      }
    } catch (error) {
      console.log(error);
      setMessage("Signup failed.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
    <Header />
    <View style={[styles.container, { flexDirection: width > 768 ? "row" : "column" }]} >
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
          placeholder="Name"
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
                <Text style={styles.welcome}>Already Have An Account ?</Text>
        {/* <Text style={styles.subText}>
          Sign in to the world where knowledge blooms !!
        </Text> */}
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
