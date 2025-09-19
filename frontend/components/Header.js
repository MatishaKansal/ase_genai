import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Image } from "react-native";
import styles from "./HeaderStyles";

export default function Header() {
  return (
    <SafeAreaView style={{ backgroundColor: "#006D77" }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoContainer}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>LegalMitra</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
