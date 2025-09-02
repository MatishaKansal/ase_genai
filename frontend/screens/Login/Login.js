import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./LoginStyles";
import { useWindowDimensions } from "react-native";
import Header from "../../components/Header";
import Signup from "../SignUp/SignUp";


const baseUrl = "http://192.168.X.X:5000";

export default function Login() {

  const { width } = useWindowDimensions();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [message, setMessage] = useState("");
    
    const navigation = useNavigation();


    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${baseUrl}/api/auth/login`, formData);
            console.log("Full response:", response)
            const token = response.data.token;
            if (token) {
                localStorage.setItem("token", token);
                console.log("token stored in localStorage:", token)
                alert("Login successful")
                navigate("/");

            } else {
                alert("Login failed: Token not received")
            }
            localStorage.setItem("user", JSON.stringify(response.data.user));
            setMessage('');
            setTimeout(() => {
                navigate("/");
            }, 1000);            

        } catch (error) {
            console.error(error.response?.data || "Login failed");
            alert("Login failed");
        }
    };

    const handleForgotPassword = async () => {
        console.log("Hello");
        try {
            alert("Password change settings");

        } catch (error) {
            console.error(error.response?.data || "Failed to send password reset link");
            alert("Failed to send password reset link");
        }
    };

  return (
    <View style={{ flex: 1 }}>
    <Header />
    <View style={[styles.container, { flexDirection: width > 768 ? "row" : "column" }]} >
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

        <TouchableOpacity style={styles.signUpButton} onPress={handleSubmit}>
          <Text style={styles.signUpText}>Login</Text>
        </TouchableOpacity>
                <Text style={styles.welcome}>New to the app?</Text>
        {/* <Text style={styles.subText}>
          Sign in to the world where knowledge blooms !!
        </Text> */}
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
