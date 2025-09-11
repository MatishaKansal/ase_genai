// import React, { useState } from "react";
// import {
//   View,
//   TextInput,
//   Text,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   Keyboard,
//   TouchableWithoutFeedback,
//   ScrollView,
//   Image,
// } from "react-native";
// import { FontAwesome } from "@expo/vector-icons";
// import styles from "./ChatStyles";
// import Header from "../../components/Header";
// import * as DocumentPicker from "expo-document-picker";

// export default function Chat() {
//   const [inputValue, setInputValue] = useState("");
//   const [isBottom, setIsBottom] = useState(false); // track position
//   const [inputHeight, setInputHeight] = useState(40); // ~1 line
//   const [scrollEnabled, setScrollEnabled] = useState(false);
//   const [prevLen, setPrevLen] = useState(0);
//   const [files, setFiles] = useState([]);

//   const ONE_LINE = 20;      // tune to your font/padding
//   const MAX_HEIGHT = ONE_LINE * 4;


//   const handleClear = () => {
//     setInputValue("");
//     setFiles([]);
//   };
//   const handleMic = () => alert("Mic pressed!");

//   const handleSizeChange = (e) => {
//     const h = e.nativeEvent.contentSize.height || ONE_LINE;
//     const clamped = Math.max(ONE_LINE, Math.min(h, MAX_HEIGHT));
//     setInputHeight(clamped);
//     setScrollEnabled(h > MAX_HEIGHT); // show scrollbar only after 4 lines
//   };

//   const handleAdd = async () => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({ multiple: true });
//       // if (result.type !== "cancel") {
//       //   setFiles((prev) => [...prev, result]);
//       // }
//       if (result.canceled === false && result.assets) {
//         // Expo DocumentPicker V11+ uses 'assets'
//         setFiles((prev) => [
//           ...prev,
//           ...result.assets.map((asset) => ({
//             ...asset,
//             mimeType: asset.mimeType || asset.type,
//             name: asset.name,
//             uri: asset.uri,
//           })),
//         ]);
//       } else if (result.type !== "cancel" && !result.assets) {
//         // Older versions of DocumentPicker
//         setFiles((prev) => [...prev, result]);
//       }
//     } catch (err) {
//       console.log("Error picking document:", err);
//     }
//   };

//   const handleFileChange = (e) => {
//     const selectedFiles = Array.from(e.target.files); // Convert FileList to Array
//     setFiles((prevFiles) => [...prevFiles, ...selectedFiles]); // Append files instead of replacing
//   };


//   const removeFile = (index) => {
//     setFiles((prev) => prev.filter((_, i) => i !== index));
//   };

//   const handleSend = () => {
//     if (!inputValue.trim() && files.length === 0) return; // empty avoid
//     alert(
//       "Message sent: " +
//       inputValue +
//       "\nFiles: " +
//       files.map((f) => f.name).join(", ")
//     );
//     setInputValue("");
//     setIsBottom(true); // ab bar permanently bottom me chala jayega
//     Keyboard.dismiss();
//     setFiles([]); // clear files on send
//   };

//   return (
//     <TouchableWithoutFeedback
//       onPress={Platform.OS === "web" ? undefined : Keyboard.dismiss}
//       accessible={false}
//     >
//       <View style={styles.container}>
//         {/* Header */}
//         <Header />

//         {/* Topbar */}
//         <View style={styles.topbar}>
//           <TouchableOpacity style={styles.topbarButton} onPress={handleClear}>
//             <Text style={{ color: "black", fontWeight: "500", fontSize: "16" }}>Clear Chat</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Main area with keyboard handling */}
//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           keyboardVerticalOffset={10} // adjust for header height
//         >
//           <View style={styles.content}></View>

//           {/* File Preview */}
//           {files.length > 0 && (
//             <ScrollView
//               horizontal
//               style={styles.previewContainer}
//               showsHorizontalScrollIndicator={false}
//             >
//               {files.map((file, index) => (
//                 <View key={index} style={styles.fileBox}>
//                   {file.mimeType?.startsWith("image/") ? (
//                     <Image
//                       source={{ uri: file.uri }}
//                       style={{ width: 60, height: 60, borderRadius: 5 }}
//                       resizeMode="cover"
//                     />
//                   ) : (
//                     <Text style={{ fontSize: 12, color: "black" }}>
//                       {file.name}
//                     </Text>
//                   )}
//                   <TouchableOpacity
//                     style={styles.removeBtn}
//                     onPress={() => removeFile(index)}
//                   >
//                     <Text style={{ color: "white", fontSize: 12 }}>x</Text>
//                   </TouchableOpacity>
//                 </View>
//               ))}
//             </ScrollView>
//           )}

//           {/* Search/Input bar */}
//           <View
//             style={ // [
//               styles.search,
//               //   isBottom
//               //     ? { position: "absolute", bottom: 10, width: "100%" }
//               //     : { flex: 1, justifyContent: "center" },
//               // ]
//               }
//           >
//             <View style={styles.inner}>
//               {/* Add button */}
//               <TouchableOpacity style={styles.add} onPress={handleAdd}>
//                 <Text style={{ color: "black", fontSize: 24 }}>+</Text>
//               </TouchableOpacity>

//               {/* Input box */}
//               <TextInput
//                 style={[
//                   styles.textarea,
//                   {
//                     minHeight: ONE_LINE,
//                     maxHeight: MAX_HEIGHT,
//                     // ❌ height: inputHeight  <-- isko hata do
//                     lineHeight: 20,
//                     paddingVertical: 6,
//                   },
//                 ]}
//                 value={inputValue}
//                 onChangeText={(text) => setInputValue(text)}
//                 placeholder="Type a message..."
//                 placeholderTextColor="black"
//                 multiline
//                 textAlignVertical="top"
//                 onContentSizeChange={(e) => {
//                   const h = e.nativeEvent.contentSize.height;

//                   // bas scroll toggle karo
//                   if (h > MAX_HEIGHT) {
//                     setScrollEnabled(true);
//                   } else {
//                     setScrollEnabled(false);
//                   }
//                 }}
//                 // scrollEnabled={scrollEnabled}
//                 scrollEnabled={scrollEnabled}

//                 returnKeyType="send"
//                 blurOnSubmit={false}
//               />
//               {/* Mic / Send button */}
//               <TouchableOpacity
//                 style={styles.switch}
//                 onPress={inputValue ? handleSend : handleMic}
//                 disabled={!inputValue && files.length === 0}
//               >
//                 {inputValue || files.length > 0 ? (
//                   <FontAwesome name="send" size={22} color="black" />
//                 ) : (
//                   <FontAwesome name="microphone" size={24} color="black" />
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>

//         </KeyboardAvoidingView>
//       </View>
//     </TouchableWithoutFeedback>
//   );
// }

import React, { useState } from "react";
import { View, TextInput, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, ScrollView, StyleSheet, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import styles from "./ChatStyles";
import Header from "../../components/Header";
import * as DocumentPicker from "expo-document-picker";

export default function Chat() {
  const [inputValue, setInputValue] = useState("");
  const [isBottom, setIsBottom] = useState(false); // track position 
  const [inputHeight, setInputHeight] = useState(40); // ~1 line 
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [prevLen, setPrevLen] = useState(0);
  const [files, setFiles] = useState([]);

  const ONE_LINE = 20; // tune to your font/padding 
  const MAX_HEIGHT = ONE_LINE * 4;

  const handleClear = () => {
    setInputValue("");
    setFiles([]);
  };

  const handleMic = () => alert("Mic pressed!");

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

  const handleSend = () => {
    if (!inputValue.trim() && files.length === 0) return; // empty avoid 
    alert("Message sent: " + inputValue + "\nFiles: " + files.map((f) => f.name).join(", "));
    setInputValue("");
    setIsBottom(true); // ab bar permanently bottom me chala jayega 
    Keyboard.dismiss();
    setFiles([]); // clear files on send 
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
              {/* MPrevious chatting will go here */}
            </ScrollView>

            {/* File Preview */}
            {/* {files.length > 0 && (
              <ScrollView
                horizontal style={styles.previewContainer}
                showsHorizontalScrollIndicator={false} >
                {files.map((file, index) => (
                  <View key={index}
                    style={styles.fileBox}>
                    <Text numberOfLines={1} style={styles.fileName}>
                      {file.name}
                    </Text>
                    <TouchableOpacity style={styles.removeBtn} onPress={() => removeFile(index)} >
                      <Text style={{ color: "white", fontSize: 12 }}>x</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>)} */}

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
                    disabled={!inputValue && files.length === 0}
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
      </View >
    </TouchableWithoutFeedback >);
}