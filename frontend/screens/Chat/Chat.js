import React, { useState } from "react";
import {
  View, TextInput, Text, TouchableOpacity,
  KeyboardAvoidingView, Platform, Keyboard,
  TouchableWithoutFeedback, ScrollView, Image
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Header from "../../components/Header";
import * as DocumentPicker from "expo-document-picker";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import styles from "./ChatStyles"; // keep your existing ChatStyles

export default function Chat() {
  const route = useRoute();
  const [inputValue, setInputValue] = useState("");
  const [files, setFiles] = useState([]);
  const [isBottom, setIsBottom] = useState(false);

  // Add photo from CameraScreen if exists
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.photo) {
        const newPhoto = {
          uri: route.params.photo,
          name: "photo.png",
          mimeType: "image/png",
        };
        setFiles((prev) => [...prev, newPhoto]);
        route.params.photo = null;
      }
    }, [route.params])
  );

  const handleAdd = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ multiple: true });
      if (result.canceled === false && result.assets) {
        setFiles((prev) => [...prev, ...result.assets]);
      } else if (result.type !== "cancel" && !result.assets) {
        setFiles((prev) => [...prev, result]);
      }
    } catch (err) {
      console.log("Error picking document:", err);
    }
  };

  const removeFile = (index) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleSend = () => {
    if (!inputValue.trim() && files.length === 0) return;
    alert("Message sent: " + inputValue + "\nFiles: " + files.map(f => f.name).join(", "));
    setInputValue("");
    setFiles([]);
    setIsBottom(true);
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={Platform.OS === "web" ? undefined : Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Header />

        {/* Topbar */}
        <View style={styles.topbar}>
          <TouchableOpacity style={styles.topbarButton} onPress={() => { setFiles([]); setInputValue(""); }}>
            <Text style={{ color: "black", fontWeight: "500", fontSize: 16 }}>Clear Chat</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={10}
        >
          <View style={styles.content}>
            <ScrollView style={styles.chatArea}>
              {/* Your chat messages will go here */}
            </ScrollView>

            {/* File/Image preview */}
            {files.length > 0 && (
              <ScrollView horizontal style={styles.previewContainer} showsHorizontalScrollIndicator={false}>
                {files.map((file, index) => (
                  <View key={index} style={styles.fileBox}>
                    {file.mimeType?.startsWith("image/") ? (
                      <Image source={{ uri: file.uri }} style={{ width: 60, height: 60, borderRadius: 5 }} />
                    ) : (
                      <Text numberOfLines={1} style={styles.fileName}>{file.name}</Text>
                    )}
                    <TouchableOpacity style={styles.removeBtn} onPress={() => removeFile(index)}>
                      <Text style={{ color: "white", fontSize: 12 }}>x</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Input Bar */}
            <View style={[styles.search, isBottom ? { position: "absolute", bottom: 10, width: "100%" } : { flex: 1, justifyContent: "center" }]}>
              <View style={styles.bottomContainer}>
                <View style={styles.inner}>
                  <TouchableOpacity style={styles.add} onPress={handleAdd}>
                    <Text style={{ color: "black", fontSize: 24 }}>+</Text>
                  </TouchableOpacity>

                  <TextInput
                    style={styles.textarea}
                    value={inputValue}
                    onChangeText={setInputValue}
                    placeholder="Type a message..."
                    placeholderTextColor="black"
                    multiline
                  />

                  <TouchableOpacity
                    style={styles.switch}
                    onPress={inputValue || files.length > 0 ? handleSend : () => alert("Mic pressed!")}
                  >
                    {inputValue || files.length > 0 ? (
                      <FontAwesome name="send" size={22} color="black" />
                    ) : (
                      <FontAwesome name="microphone" size={24} color="black" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}
