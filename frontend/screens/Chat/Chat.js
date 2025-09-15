import React, { useState, useCallback } from "react";
import {
  View, TextInput, Text, TouchableOpacity,
  KeyboardAvoidingView, Platform, Keyboard,
  TouchableWithoutFeedback, ScrollView, Image, Linking
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import * as DocumentPicker from "expo-document-picker";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import styles from "./ChatStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Audio } from "expo-av";


const baseUrl = "http://localhost:5000";

export default function Chat() {
  const route = useRoute();
  const [inputValue, setInputValue] = useState("");
  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notebookId, setNotebookId] = useState(route.params?.notebookId || ""); // initial notebookId
  const [sound, setSound] = useState(null);

  // ✅ Add photo from CameraScreen if exists
  useFocusEffect(
    useCallback(() => {
      if (route.params?.photo) {
        const newPhoto = {
          uri: route.params.photo,
          name: "photo.png",
          type: "image/png",
        };
        setFiles((prev) => [...prev, newPhoto]);
        route.params.photo = null;
      }
    }, [route.params])
  );

  // ✅ Fetch chat messages
  const fetchChat = useCallback(async (id) => {
    try {
      const user = await AsyncStorage.getItem("user");
      if (!user) {
        setMessages([]);
        return;
      }
      const { userId } = JSON.parse(user);

      if (id) {
        const res = await axios.get(`${baseUrl}/api/chat/${userId}/${id}`);
        setMessages(Array.isArray(res.data.messages) ? res.data.messages : []);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.log("Error fetching chat:", err.message);
      setMessages([]);
      setNotebookId("");
    }
  }, []);

  // ✅ Update notebookId and fetch chat when route param changes
  useFocusEffect(
    useCallback(() => {
      if (route.params?.notebookId) {
        setNotebookId(route.params.notebookId);
        fetchChat(route.params.notebookId);
      } else {
        fetchChat(notebookId);
      }
    }, [route.params?.notebookId, notebookId])
  );

  const handleNewChat = () => {
    setInputValue("");
    setFiles([]);
    setNotebookId("");
  };

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


  async function playAudio(url) {
    try {
      if (sound) {
        await sound.unloadAsync(); // pehle ka audio clear
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
      setSound(newSound);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  }
  const handleSend = async () => {
    const user = await AsyncStorage.getItem("user");
    if (!user) return;

    const { userId } = JSON.parse(user);
    if (!inputValue.trim() && files.length === 0) return;

    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("notebookId", notebookId);

      const messagesToSend = [{ sender: "user", message: inputValue, file: null }];
      formData.append("messages", JSON.stringify(messagesToSend));

      files.forEach((file) => {
        formData.append("files", {
          uri: file.uri,
          name: file.name,
          type: file.type || file.mimeType,
        });
      });

      const res = await axios.post(`${baseUrl}/api/chat/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!notebookId) setNotebookId(res.data.notebookId);

      setMessages(Array.isArray(res.data.messages) ? res.data.messages : []);
      setInputValue("");
      setFiles([]);
    } catch (err) {
      console.log("Error sending chat:", err.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Platform.OS === "web" ? undefined : Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Header />
        <View style={styles.topbar}>
          <TouchableOpacity style={styles.topbarButton} onPress={handleNewChat}>
            <Text style={{ color: "black", fontWeight: "500", fontSize: 16 }}>New Chat</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={10}
        >
          <View style={styles.content}>
            <ScrollView style={styles.chatArea}>
              {messages.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageBubble,
                    msg.sender === "user" ? styles.userBubble : styles.botBubble,
                  ]}
                >
                  {/* Message text */}
                  {msg.message ? (
                    <Text style={styles.messageText}>{msg.message}</Text>
                  ) : null}

                  {/* File handling */}
                  {msg.file && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(msg.file.fileUrl)}
                      style={styles.fileContainer}
                    >
                      {msg.file.fileType.startsWith("image/") ? (
                        <Image
                          source={{ uri: msg.file.fileUrl }}
                          style={styles.fileImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text style={styles.fileLink}>{msg.file.fileName}</Text>
                      )}
                    </TouchableOpacity>
                  )}

                  {/* Speaker button only for bot */}
                  {msg.sender === "bot" && (
                    <TouchableOpacity
                      style={styles.speakerButton}
                      onPress={() => playAudio(msg.audioUrl)}
                    >
                      <Ionicons name="volume-high" size={20} color="#1f2937" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>

          </View>

          <View style={styles.search}>
            <View style={styles.bottomContainer}>
              {files.length > 0 && (
                <ScrollView horizontal style={styles.previewContainer} showsHorizontalScrollIndicator={false}>
                  {files.map((file, index) => (
                    <View key={index} style={styles.fileBox}>
                      {file.type?.startsWith("image/") ? (
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
                  blurOnSubmit={false} // Important to keep cursor in TextInput
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === "Enter") {
                      if (!nativeEvent.shiftKey) { // Enter without Shift -> Send
                        handleSend();
                      } else {
                        setInputValue(prev => prev ); // Shift+Enter -> New line
                      }
                    }
                  }}
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
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}
