import React, { useState, useCallback } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Image,
  Linking
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import * as DocumentPicker from "expo-document-picker";
import { useRoute, useFocusEffect, useNavigation } from "@react-navigation/native";
import createStyles from "./ChatStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Audio } from "expo-av";
import { Picker } from "@react-native-picker/picker";
import { lightTheme, darkTheme } from "../../components/theme";

const baseUrl = "http://localhost:5000";

export default function Chat() {
  const route = useRoute();
  const navigation = useNavigation();

  const [darkMode, setDarkMode] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notebookId, setNotebookId] = useState(route.params?.notebookId || "");
  const [sound, setSound] = useState(null);
  const [selectedLang, setSelectedLang] = useState("en");

  const theme = darkMode ? darkTheme : lightTheme;
  const styles = createStyles(theme);

  // Load darkMode from AsyncStorage
  useFocusEffect(
    useCallback(() => {
      const loadTheme = async () => {
        const savedTheme = await AsyncStorage.getItem("darkMode");
        if (savedTheme !== null) setDarkMode(JSON.parse(savedTheme));
      };
      loadTheme();
    }, [])
  );

  // Handle photo passed from CameraScreen
  useFocusEffect(
    useCallback(() => {
      if (route.params?.photo) {
        const newPhoto = {
          uri: route.params.photo.startsWith("file://") ? route.params.photo : "file://" + route.params.photo,
          name: "photo.png",
          type: "image/png",
        };
        setFiles(prev => [...prev, newPhoto]);
        route.params.photo = null;
      }
    }, [route.params])
  );

  // Fetch chat messages
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

  // Update notebookId and fetch chat
  useFocusEffect(
    useCallback(() => {
      if (route.params?.notebookId) {
        setNotebookId(route.params.notebookId);
        fetchChat(route.params.notebookId);
      } else if (notebookId) {
        fetchChat(notebookId);
      } else {
        setMessages([]);
      }
    }, [route.params?.notebookId, notebookId])
  );

  const handleNewChat = () => {
    setInputValue("");
    setFiles([]);
    setMessages([]);
    setNotebookId("");
    navigation.setParams({ notebookId: undefined, photo: undefined });
  };

  const handleAdd = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ multiple: true });
      if (!result.canceled) {
        const pickedFiles = result.assets || [result];
        const normalizedFiles = pickedFiles.map(f => ({
          uri: f.uri.startsWith("file://") ? f.uri : "file://" + f.uri,
          name: f.name,
          type: f.mimeType || f.type || "application/octet-stream",
        }));
        setFiles(prev => [...prev, ...normalizedFiles]);
      }
    } catch (err) {
      console.log("Error picking document:", err);
    }
  };

  const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));

  async function playAudio(url) {
    try {
      if (sound) await sound.unloadAsync();
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
      setSound(newSound);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  }

  const handleSend = async () => {
    try {
      const user = await AsyncStorage.getItem("user");
      if (!user) return;
      const { userId } = JSON.parse(user);

      if (!inputValue.trim() && files.length === 0) return;
      if (!notebookId && files.length === 0) {
        alert("Please upload at least one file to start a new chat.");
        return;
      }

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("notebookId", notebookId || "");
      const messagesToSend = [
        { sender: "user", message: inputValue, file: null, language: selectedLang },
      ];
      formData.append("messages", JSON.stringify(messagesToSend));

      const debugFiles = []; // debug info to log what we append

      console.log("frontend files array:", files);
      for (const file of files) {
        if (!file || !file.uri) continue;
        let uri = file.uri;
        if (Platform.OS === "android" && !uri.startsWith("file://") && !uri.startsWith("content://")) {
          uri = "file://" + uri;
        }
        formData.append("files", { uri, name: file.name || `upload-${Date.now()}`, type: file.type || "application/octet-stream" });
        console.log("Appended file:", uri, file.name, file.type);
      }
      const res = await axios.post(`${baseUrl}/api/chat/${userId}`, formData, { headers: { Accept: "application/json" } });

      if (!notebookId) setNotebookId(res.data.notebookId);
      setMessages(Array.isArray(res.data.messages) ? res.data.messages : []);
      setInputValue("");
      setFiles([]);
    } catch (err) {
      console.log("Error sending chat:", err?.message || err, err?.response?.data || "");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <TouchableWithoutFeedback onPress={Platform.OS !== "web" ? Keyboard.dismiss : undefined} accessible={false}>
        <View style={styles.container}>
          <Header />
          <View style={styles.topbar}>
            <TouchableOpacity style={styles.topbarButton} onPress={handleNewChat}>
              <Text style={{ color: theme.text, fontWeight: "500", fontSize: 16 }}>New Chat</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mode_container}>
            <TouchableOpacity onPress={() => setDarkMode(!darkMode)}>
              <Ionicons name={darkMode ? "sunny" : "moon"} size={32} color={darkMode ? "#BEBEBE" : "#fff"} />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={10}>
            <View style={styles.content}>
              <ScrollView style={styles.chatArea}>
                {messages.map((msg, index) => (
                  <View key={index} style={[styles.messageBubble, msg.sender === "user" ? styles.userBubble : styles.botBubble]}>
                    {msg.message && <Text style={[styles.messageText, { color: theme.text }]}>{msg.message}</Text>}

                    {msg.file && (
                      <TouchableOpacity onPress={() => Linking.openURL(msg.file.fileUrl)} style={styles.fileContainer}>
                        {msg.file.fileType.startsWith("image/") ? (
                          <Image source={{ uri: msg.file.fileUrl }} style={styles.fileImage} resizeMode="cover" />
                        ) : (
                          <Text style={[styles.fileLink, { color: theme.text }]}>{msg.file.fileName}</Text>
                        )}
                      </TouchableOpacity>
                    )}

                    {msg.sender === "bot" && msg.audioUrl && (
                      <TouchableOpacity style={styles.speakerButton} onPress={() => playAudio(msg.audioUrl)}>
                        <Ionicons name="volume-high" size={20} color={theme.text} />
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
                        {file.type.startsWith("image/") ? (
                          <Image source={{ uri: file.uri }} style={{ width: 60, height: 60, borderRadius: 5 }} />
                        ) : (
                          <Text numberOfLines={1} style={[styles.fileName, { color: theme.text }]}>{file.name}</Text>
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
                    <Text style={{ color: theme.text, fontSize: 24 }}>+</Text>
                  </TouchableOpacity>

                  <TextInput
                    style={[styles.textarea, { color: theme.text, borderColor: theme.text }]}
                    value={inputValue}
                    onChangeText={setInputValue}
                    placeholder="Upload files and start asking questions..."
                    placeholderTextColor={theme.text}
                    multiline
                    blurOnSubmit={false}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === "Enter" && !nativeEvent.shiftKey) handleSend();
                    }}
                  />

                  <View style={styles.dropdownWrapper}>
                    <Picker
                      selectedValue={selectedLang}
                      style={[styles.dropdown, { color: theme.text }]}
                      onValueChange={(itemValue) => setSelectedLang(itemValue)}
                    >
                      <Picker.Item label="English" value="en" />
                      <Picker.Item label="हिंदी" value="hi" />
                      <Picker.Item label="ਪੰਜਾਬੀ" value="pu" />
                      <Picker.Item label="தமிழ்" value="ta" />
                    </Picker>
                  </View>

                  <TouchableOpacity
                    style={styles.switch}
                    onPress={inputValue || files.length > 0 ? handleSend : () => alert("Mic pressed!")}
                  >
                    {inputValue || files.length > 0 ? (
                      <FontAwesome name="send" size={22} color={theme.text} />
                    ) : (
                      <FontAwesome name="microphone" size={24} color={theme.text} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}
