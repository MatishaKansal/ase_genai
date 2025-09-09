import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import styles from "./ChatStyles";
import Header from "../../components/Header";

export default function Chat() {
  const [inputValue, setInputValue] = useState("");
  const [isBottom, setIsBottom] = useState(false); // track position
  const [inputHeight, setInputHeight] = useState(40); // ~1 line
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [prevLen, setPrevLen] = useState(0);

  const ONE_LINE = 20;      // tune to your font/padding
  const MAX_HEIGHT = ONE_LINE * 4;


  const handleClear = () => setInputValue("");
  const handleAdd = () => alert("Add button clicked!");
  const handleMic = () => alert("Mic pressed!");

  const handleSizeChange = (e) => {
    const h = e.nativeEvent.contentSize.height || ONE_LINE;
    const clamped = Math.max(ONE_LINE, Math.min(h, MAX_HEIGHT));
    setInputHeight(clamped);
    setScrollEnabled(h > MAX_HEIGHT); // show scrollbar only after 4 lines
  };


  const handleSend = () => {
    if (!inputValue.trim()) return; // empty avoid
    alert("Message sent: " + inputValue);
    setInputValue("");
    setIsBottom(true); // ab bar permanently bottom me chala jayega
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback
      onPress={Platform.OS === "web" ? undefined : Keyboard.dismiss}
      accessible={false}
    >
      <View style={styles.container}>
        {/* Header */}
        <Header />

        {/* Topbar */}
        <View style={styles.topbar}>
          <TouchableOpacity style={styles.topbarButton} onPress={handleClear}>
            <Text style={{ color: "black", fontWeight: "500", fontSize: "16" }}>Clear Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Main area with keyboard handling */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={10} // adjust for header height
        >
          <View style={styles.content}>
            {/* Search/Input bar */}
            <View
              style={[
                styles.search,
                isBottom
                  ? { position: "absolute", bottom: 10, width: "100%" }
                  : { flex: 1, justifyContent: "center" },
              ]}
            >
              <View style={styles.inner}>
                {/* Add button */}
                <TouchableOpacity style={styles.add} onPress={handleAdd}>
                  <Text style={{ color: "black", fontSize: 24 }}>+</Text>
                </TouchableOpacity>

                {/* Input box */}
                <TextInput
                  style={[
                    styles.textarea,
                    {
                      minHeight: ONE_LINE,
                      maxHeight: MAX_HEIGHT,
                      // ❌ height: inputHeight  <-- isko hata do
                      lineHeight: 20,
                      paddingVertical: 6,
                    },
                  ]}
                  value={inputValue}
                  onChangeText={(text) => setInputValue(text)}
                  placeholder="Type a message..."
                  placeholderTextColor="black"
                  multiline
                  textAlignVertical="top"
                  onContentSizeChange={(e) => {
                    const h = e.nativeEvent.contentSize.height;

                    // bas scroll toggle karo
                    if (h > MAX_HEIGHT) {
                      setScrollEnabled(true);
                    } else {
                      setScrollEnabled(false);
                    }
                  }}
                  scrollEnabled={scrollEnabled}
                  returnKeyType="send"
                  blurOnSubmit={false}
                  />
                {/* Mic / Send button */}
                <TouchableOpacity
                  style={styles.switch}
                  onPress={inputValue ? handleSend : handleMic}
                  disabled={!inputValue}
                >
                  {inputValue ? (
                    <FontAwesome name="send" size={22} color="black" />
                  ) : (
                    <FontAwesome name="microphone" size={24} color="black" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}
