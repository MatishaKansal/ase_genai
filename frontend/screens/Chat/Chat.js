

import React, { useState } from "react";
import { View, TextInput, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, ScrollView, StyleSheet, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import styles from "./ChatStyles";
import Header from "../../components/Header";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Import Voice for native platforms only
let Voice;
if (Platform.OS !== "web") {
  Voice = require("@react-native-voice/voice").default;
}

export default function Chat() {
  const [inputValue, setInputValue] = useState("");
  const [isBottom, setIsBottom] = useState(false); // track position 
  const [inputHeight, setInputHeight] = useState(40); // ~1 line 
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [prevLen, setPrevLen] = useState(0);
  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notebookId, setNotebookId] = useState("");
  const [recognition, setRecognition] = useState(null); // State for Web Speech API
  const [isRecording, setIsRecording] = useState(false); // ✅ Added isRecording state

  // ** Web and Native Voice Recognition Setup **
  useEffect(() => {
    if (Platform.OS !== "web" && Voice) {
      Voice.onSpeechStart = () => setIsRecording(true);
      Voice.onSpeechEnd = () => setIsRecording(false);
      Voice.onSpeechResults = (e) => {
        setInputValue(e.value[0]);
      };
      Voice.onSpeechError = (e) => {
        console.error("Native Speech Error:", e.error);
        setIsRecording(false);
      };
      return () => {
        Voice.destroy().then(Voice.removeAllListeners);
      };
    } else if (Platform.OS === 'web') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = "en-US";
        
        recognitionInstance.onstart = () => setIsRecording(true);
        recognitionInstance.onend = () => setIsRecording(false);
        recognitionInstance.onresult = (e) => {
          let transcript = "";
          for (let i = e.resultIndex; i < e.results.length; ++i) {
            if (e.results[i].isFinal) {
              transcript += e.results[i][0].transcript;
            }
          }
          if (transcript) {
            setInputValue(prev => prev + transcript);
          }
        };
        recognitionInstance.onerror = (e) => {
          console.error("Web Speech Error:", e.error);
          setIsRecording(false);
        };
        setRecognition(recognitionInstance);
      }
    }
  }, []);

  // ✅ CORRECTED useEffect to handle null user data
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const user = await AsyncStorage.getItem("user");
        if (!user) { // ✅ Handle null user
          console.log("No user found, starting a new chat.");
          setMessages([]);
          return;
        }
        const { userId } = JSON.parse(user);

        if (notebookId) {
          const res = await axios.get(`/api/chat/${userId}/${notebookId}`);
          setMessages(res.data);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.log("Error fetching chat:", err.message);
      }
    };
    fetchChat();
  }, [notebookId]);



  const ONE_LINE = 20; // tune to your font/padding 
  const MAX_HEIGHT = ONE_LINE * 4;

  const handleClear = () => {
    setInputValue("");
    setFiles([]);
  };

  const handleMic = () => {
    if (isRecording) {
      // Stop recording
      if (Platform.OS !== "web") {
        Voice.stop();
      } else if (recognition) {
        recognition.stop();
      }
    } else {
      // Start recording
      setInputValue(""); // Clear input before starting
      if (Platform.OS !== "web") {
        Voice.start("en-US");
      } else if (recognition) {
        recognition.start();
      }
    }
  };

  const handleSizeChange = (e) => {
    const h = e.nativeEvent.contentSize.height || ONE_LINE;
    const clamped = Math.max(ONE_LINE, Math.min(h, MAX_HEIGHT));
    setInputHeight(clamped);
    setScrollEnabled(h > MAX_HEIGHT); // show scrollbar only after 4 lines 
  };


  const handleAdd = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ multiple: true });
      if (result.canceled === false && result.assets) {
        setFiles((prev) => [...prev, ...result.assets]);

      } else if (result.type !== "cancel" && !result.assets) {
        // Older versions of DocumentPicker
        setFiles((prev) => [...prev, result]);
      }
    } catch (err) {
      console.log("Error picking document:", err);
    }
  };
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };


  const handleSend = async () => {
    if (!inputValue.trim() && files.length === 0) return;

    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("notebookId", notebookId); // might be empty for first message

      // Add text message
      if (inputValue.trim()) {
        formData.append(
          "messages",
          JSON.stringify([{ sender: "user", message: inputValue, file: null }])
        );
      }

      // Add files
      files.forEach((file) => {
        formData.append("files", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
        });
      });

      // Post to backend
      const res = await axios.post(`/api/chat/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!notebookId) setNotebookId(res.data.notebookId);


      setMessages(res.data.messages);
      setInputValue("");
      setFiles([]);
      setIsBottom(true);
      Keyboard.dismiss();
    } catch (err) {
      console.log("Error sending chat:", err.message);
    }
  };


  return (
    <TouchableWithoutFeedback
      onPress={Platform.OS === "web" ? undefined : Keyboard.dismiss} accessible={false} >
      <View style={styles.container}> {/* Header */}
        <Header />

        {/* Topbar */}
        <View style={styles.topbar}>
          <TouchableOpacity
            style={styles.topbarButton}
            onPress={handleClear}>
            <Text style={{ color: "black", fontWeight: "500", fontSize: "16" }}>
              Clear Chat
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main area with keyboard handling */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={10} // adjust for header height 
        >

          <View
            style={styles.content}>
            <ScrollView style={styles.chatArea}>
              {messages.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageBubble,
                    msg.sender === "user" ? styles.userBubble : styles.botBubble
                  ]}
                >
                  {/* Text Messages */}
                  {msg.message ? (
                    <Text style={styles.messageText}>{msg.message}</Text>
                  ) : null}

                  {/* File Messages */}
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
                </View>
              ))}
            </ScrollView>



            {/* Search/Input bar */}
            <View style={[styles.search, isBottom ?
              { position: "absolute", bottom: 10, width: "100%" } :
              { flex: 1, justifyContent: "center" },]} >
              {/* Fixed bottom area */}
              <View style={styles.bottomContainer}>
                {/* File preview above the input */}
                {files.length > 0 && (
                  <ScrollView
                    horizontal
                    style={styles.previewContainer}
                    showsHorizontalScrollIndicator={false}
                  >
                    {files.map((file, index) => (
                      <View key={index} style={styles.fileBox}>
                        {file.mimeType?.startsWith("image/") ? (
                          <Image
                            source={{ uri: file.uri }}
                            style={{ width: 60, height: 60, borderRadius: 5 }}
                          />
                        ) : (
                          <Text numberOfLines={1} style={styles.fileName}>
                            {file.name}
                          </Text>
                        )}
                        <TouchableOpacity
                          style={styles.removeBtn}
                          onPress={() => removeFile(index)}
                        >
                          <Text style={{ color: "white", fontSize: 12 }}>x</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}

                {/* Input Row */}
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
                    onPress={inputValue || files.length > 0 ? handleSend : handleMic}
                    disabled={
                      !(Platform.OS === 'web' ? recognition : Voice) ||
                      (!inputValue.trim() && files.length === 0 && !isRecording)
                    }
                  >
                    {inputValue || files.length > 0 ? (
                      <FontAwesome name="send" size={22} color="black" />
                    ) : (
                      <FontAwesome
                        name={isRecording ? "stop-circle" : "microphone"}
                        size={24}
                        color={isRecording ? "red" : "black"}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View >
    </TouchableWithoutFeedback >);
}