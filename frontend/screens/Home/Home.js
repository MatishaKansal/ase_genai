import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Image
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import styles from "./HomeStyles";
import { useNavigation } from "@react-navigation/native";

export default function Home() {
  const navigation = useNavigation();
  const [hoveredBox, setHoveredBox] = useState(null);

  const contentData = [
    {
      id: 1,
      icon: "upload",
      color: "#43D9D9",
      title: "Upload & Score Your Documents",
      text: "Simply click a photo of your legal document, upload it, and let our AI provide a clear, easy-to-understand score.",
    },
    {
      id: 2,
      icon: "comment-alt",
      color: "rgb(100,209,100)",
      title: "Get Instant AI Consultation",
      text: "Chat with our AI about your documents. Ask questions, clarify clauses, and understand complex legal terms without the hassle.",
    },
    {
      id: 3,
      icon: "lock",
      color: "rgb(217,184,123)",
      title: "Keep Your Records Secure",
      text: "Your documents and their scores are saved securely. Track your history and access past insights whenever you need them.",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Navbar */}
      <View style={styles.navbar}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>LegalMitra</Text>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginText}>Login / Sign Up</Text>
        </TouchableOpacity>
      </View>

        {/* Hero Section */}
        <Text style={styles.heroTitle}>
          Secure Your Legacy with AI-Powered Document Analysis
        </Text>
        <Text style={styles.heroSubtitle}>
          Instantly score legal documents, protect against fraud, and get clear
          answers from an AI assistant
        </Text>

        {/* Content Section */}
        <View style={styles.content}>
          {contentData.map((box) => (
            <Pressable
              key={box.id}
              style={[
                styles.contentBox,
                hoveredBox === box.id && styles.contentBoxHover,
              ]}
              onMouseEnter={() => setHoveredBox(box.id)}
              onMouseLeave={() => setHoveredBox(null)}
            >
              <FontAwesome5
                name={box.icon}
                size={50}
                color={box.color}
                style={styles.boxIcon}
              />
              <Text style={styles.boxTitle}>{box.title}</Text>
              <Text style={styles.boxText}>{box.text}</Text>
            </Pressable>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Ready To Get Started?</Text>
          <Text style={styles.footerSubtitle}>
            Gain peace of mind and protect yourself from fraud
          </Text>
          <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.footerButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
