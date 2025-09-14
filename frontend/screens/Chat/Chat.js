import React, { useState, useEffect } from "react";
import {
  View, TextInput, Text, TouchableOpacity,
  KeyboardAvoidingView, Platform, Keyboard,
  TouchableWithoutFeedback, ScrollView, Image, Linking
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Header from "../../components/Header";
import * as DocumentPicker from "expo-document-picker";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import styles from "./ChatStyles"; // keep your existing ChatStyles
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const baseUrl = "http://localhost:5000";

// ================= VOICE CODE COMMENTED ================= //
// import "@react-native-voice/voice"
// let Voice = null;
// if (Platform.OS !== "web") {
//   try {
//     Voice = require("@react-native-voice/voice")?.default;
//   } catch (e) {
//     console.log("Voice package not installed, continuing without it.");
//   }
// }

export default function Chat() {
  const route = useRoute();
  const [inputValue, setInputValue] = useState("");
  const [files, setFiles] = useState([]);

  // Add photo from CameraScreen if exists
  useFocusEffect(
    React.useCallback(() => {
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

  const [messages, setMessages] = useState([]);
  const [notebookId, setNotebookId] = useState("");

  // ================= VOICE STATES COMMENTED ================= //
  // const [recognition, setRecognition] = useState(null); 
  // const [isRecording, setIsRecording] = useState(false); 

  // ================= VOICE INITIALIZATION COMMENTED ================= //
  // useEffect(() => {
  //   if (Platform.OS !== "web" && Voice) {
  //     Voice.onSpeechStart = () => setIsRecording(true);
  //     Voice.onSpeechEnd = () => setIsRecording(false);
  //     Voice.onSpeechResults = (e) => {
  //       setInputValue(e.value[0]);
  //     };
  //     Voice.onSpeechError = (e) => {
  //       console.error("Native Speech Error:", e.error);
  //       setIsRecording(false);
  //     };
  //     return () => {
  //       Voice.destroy().then(Voice.removeAllListeners);
  //     };
  //   } else if (Platform.OS === 'web') {
  //     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  //     if (SpeechRecognition) {
  //       const recognitionInstance = new SpeechRecognition();
  //       recognitionInstance.continuous = true;
  //       recognitionInstance.interimResults = false;
  //       recognitionInstance.lang = "en-US";
  //       recognitionInstance.onstart = () => setIsRecording(true);
  //       recognitionInstance.onend = () => setIsRecording(false);
  //       recognitionInstance.onresult = (e) => {
  //         let transcript = "";
  //         for (let i = e.resultIndex; i < e.results.length; ++i) {
  //           if (e.results[i].isFinal) {
  //             transcript += e.results[i][0].transcript;
  //           }
  //         }
  //         if (transcript) {
  //           setInputValue(prev => prev + transcript);
  //         }
  //       };
  //       recognitionInstance.onerror = (e) => {
  //         console.error("Web Speech Error:", e.error);
  //         setIsRecording(false);
  //       };
  //       setRecognition(recognitionInstance);
  //     }
  //   }
  // }, []);

  // ✅ Fetch Chat from Backend
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const user = await AsyncStorage.getItem("user");
        if (!user) {
          console.log("No user found, starting a new chat.");
          setMessages([]);
          return;
        }
        const { userId } = JSON.parse(user);

        if (notebookId) {
          const res = await axios.get(`${baseUrl}/api/chat/${userId}/${notebookId}`);
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

  const ONE_LINE = 20;
  const MAX_HEIGHT = ONE_LINE * 4;

  const handleClear = () => {
    setInputValue("");
    setFiles([]);
  };

  // ================= MIC HANDLER COMMENTED ================= //
  // const handleMic = () => {
  //   if (isRecording) {
  //     if (Platform.OS !== "web") {
  //       Voice.stop();
  //     } else if (recognition) {
  //       recognition.stop();
  //     }
  //   } else {
  //     setInputValue("");
  //     if (Platform.OS !== "web") {
  //       Voice.start("en-US");
  //     } else if (recognition) {
  //       recognition.start();
  //     }
  //   }
  // };

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

  const handleSend = async () => {
    const user = await AsyncStorage.getItem("user");
    if (!user) return;

    const parsedUser = JSON.parse(user);

    const { userId } = parsedUser;
    if (!inputValue.trim() && files.length === 0) return;

    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("notebookId", notebookId);

      if (inputValue.trim()) {
        formData.append(
          "messages",
          JSON.stringify([{ sender: "user", message: inputValue, file: null }])
        );
      }

      files.forEach((file) => {
        const fileToUpload = {
          uri: file.uri,
          name: file.name,
          type: file.type || file.mimeType,
        };
        formData.append("files", fileToUpload);
      });

      console.log("FormData Contents:");
    for (let pair of formData.entries()) {
      console.log(pair[0], ':', pair[1]);
    }

      const res = await axios.post(`${baseUrl}/api/chat/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!notebookId) setNotebookId(res.data.notebookId);

      setMessages(res.data.messages);
      setInputValue("");
      setFiles([]);
      Keyboard.dismiss();
    } catch (err) {
      console.log("Error sending chat:", err.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Platform.OS === "web" ? undefined : Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Header />

        {/* Topbar */}
        <View style={styles.topbar}>
          <TouchableOpacity style={styles.topbarButton} onPress={handleClear}>
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
              {messages.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageBubble,
                    msg.sender === "user" ? styles.userBubble : styles.botBubble
                  ]}
                >
                  {msg.message ? (
                    <Text style={styles.messageText}>{msg.message}</Text>
                  ) : null}

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
          </View>

          {/* Search/Input bar */}
          <View style={styles.search}
          >

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

              <View style={[styles.search
              ]}>
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

                    {/* ================= MIC BUTTON COMMENTED ================= */}
                    {/* <TouchableOpacity
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
                    </TouchableOpacity> */}

                    {/* Simplified → Only Send / Mic Placeholder */}
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
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}
