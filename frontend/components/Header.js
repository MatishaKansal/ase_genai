import React from "react";
import { View, Text, StyleSheet, TouchableOpacity,SafeAreaView  } from "react-native";
import styles from "./HeaderStyles";


export default function Header() {
  return (
    <SafeAreaView style={{ backgroundColor: "#1f2937" }}>
    <View style={styles.header}>
      {/* {onBack && ( */}
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backText}>LOGO</Text>
        </TouchableOpacity>
      {/* )} */}
    </View>
    </SafeAreaView>
  );
}