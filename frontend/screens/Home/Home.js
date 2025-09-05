import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import styles from "./HomeStyles";
import { useNavigation } from "@react-navigation/native";


export default function Home() {
    const navigation = useNavigation();
    
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
    //   contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* Navbar */}
        <View style={styles.navbar}>
          <Text style={styles.logo}>LOGO</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate("Login")}>
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
          {/* Box 1 */}
          <View style={styles.contentBox}>
            <FontAwesome5
              name="upload"
              size={50}
              color="#43D9D9"
              style={styles.boxIcon}
            />
            <Text style={styles.boxTitle}>Upload & Score Your Documents</Text>
            <Text style={styles.boxText}>
              Simply click a photo of your legal document, upload it, and let
              our AI provide a clear, easy-to-understand score.
            </Text>
          </View>

          {/* Box 2 */}
          <View style={styles.contentBox}>
            <FontAwesome5
              name="comment-alt"
              size={50}
              color="rgb(100,209,100)"
              style={styles.boxIcon}
            />
            <Text style={styles.boxTitle}>Get Instant AI Consultation</Text>
            <Text style={styles.boxText}>
              Chat with our AI about your documents. Ask questions, clarify
              clauses, and understand complex legal terms without the hassle.
            </Text>
          </View>

          {/* Box 3 */}
          <View style={styles.contentBox}>
            <FontAwesome5
              name="lock"
              size={50}
              color="rgb(217,184,123)"
              style={styles.boxIcon}
            />
            <Text style={styles.boxTitle}>Keep Your Records Secure</Text>
            <Text style={styles.boxText}>
              Your documents and their scores are saved securely. Track your
              history and access past insights whenever you need them.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Ready To Get Started?</Text>
          <Text style={styles.footerSubtitle}>
            Gain peace of mind and protect yourself from fraud
          </Text>
          <TouchableOpacity style={styles.footerButton}>
            <Text style={styles.footerButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
