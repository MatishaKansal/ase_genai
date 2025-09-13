import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image, AppState } from "react-native";
import { Camera } from "expo-camera";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

export default function CameraScreen() {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const appState = useRef(AppState.currentState);

  // Handle app background
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current === "active" && nextAppState.match(/inactive|background/)) {
        stopCamera();
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, []);

  const startCamera = async () => {
    if (Platform.OS === "web") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        mediaStreamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setHasPermission(true);
      } catch {
        setHasPermission(false);
      }
    } else {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    }
  };

  const stopCamera = () => {
    if (Platform.OS === "web" && mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (cameraRef.current) cameraRef.current.pausePreview?.();
  };

  // Request permission on mount
  useEffect(() => {
    if (hasPermission === null) startCamera();
  }, []);

  // Resume camera when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      if (hasPermission) {
        if (Platform.OS === "web" && !mediaStreamRef.current) {
          startCamera();
        } else if (Platform.OS !== "web" && cameraRef.current && !photoUri) {
          cameraRef.current.resumePreview?.();
        }
      }
      return () => stopCamera();
    }, [hasPermission, photoUri])
  );

  if (hasPermission === null)
    return <View style={styles.center}><Text>Requesting camera permission...</Text></View>;

  if (hasPermission === false)
    return <View style={styles.center}><Text>No access to camera</Text></View>;

  // Photo preview screen
  if (photoUri) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: photoUri }} style={styles.previewImage} />
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => {
            navigation.navigate("Chat", { photo: photoUri });
            setPhotoUri(null);
          }}
        >
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.retakeButton}
          onPress={() => setPhotoUri(null)}
        >
          <Text style={styles.retakeText}>Retake</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Camera screen
  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        <video ref={videoRef} style={styles.webCamera} autoPlay playsInline />
      ) : (
        <Camera
          style={styles.camera}
          ref={cameraRef}
          type={Camera.Constants.Type.back}
          onCameraReady={() => setCameraReady(true)}
        />
      )}

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={async () => {
          if (Platform.OS === "web" && videoRef.current) {
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            setPhotoUri(canvas.toDataURL("image/png"));
          } else if (cameraRef.current && cameraReady) {
            const photo = await cameraRef.current.takePictureAsync();
            setPhotoUri(photo.uri);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  camera: { flex: 1 },
  webCamera: { width: "100%", height: "100%" },

  floatingButton: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    borderWidth: 5,
    borderColor: "#ccc",
  },

  previewContainer: { flex: 1, backgroundColor: "#000" },
  previewImage: { flex: 1, resizeMode: "contain" },

  doneButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#4DBF99",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  doneText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  retakeButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retakeText: { color: "#000", fontWeight: "bold", fontSize: 16 },
});
