import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
  Platform,
  Alert,
  useColorScheme,
} from "react-native";
import { BlurView } from "expo-blur";
import * as Speech from "expo-speech";
import { FontAwesome, Entypo } from "@expo/vector-icons";
import { showMessage } from "react-native-flash-message";
import { getColorScheme } from "../../../config/color";
import { useTabHeaderPadding } from "../../../hooks/useTabHeaderPadding";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ms, s, vs } from "react-native-size-matters";

const ACCENT = "#FF5700";

const GeminiChat = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const topPadding = useTabHeaderPadding();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { backgroundColor, textColor, groupBoxColor } = getColorScheme();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputBottomPadding = Math.max(insets.bottom, s(8));
  const isIOS = Platform.OS === "ios";
  const blurTint = colorScheme === "dark" ? "dark" : "light";

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY;

  // Correct Gemini REST API endpoint and model name
  const fetchGemini = async (prompt: string) => {
    const apiKey = API_KEY;
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=" +
      apiKey;
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
    };
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    console.log("Gemini API response:", data);
    if (data.error) {
      Alert.alert("Failed to connect!", data.error.message);
      throw new Error(data.error.message || "Gemini API error");
    }
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;
    setLoading(true);
    const userMessage = {
      text: userInput,
      user: true,
      id: Date.now().toString(),
    };
    setMessages((prev) => [userMessage, ...prev]);
    setUserInput("");
    try {
      const text = await fetchGemini(userMessage.text);
      const botMessage = { text, user: false, id: (Date.now() + 1).toString() };
      setMessages((prev) => [botMessage, ...prev]);
      if (text) {
        Speech.speak(text, { onDone: () => setIsSpeaking(false) });
        setIsSpeaking(true);
      }
    } catch (error: any) {
      showMessage({
        message: "Error",
        description: error.message || "Failed to get response from Gemini.",
        type: "danger",
        icon: "danger",
        duration: 2000,
      });
    }
    setLoading(false);
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else if (messages.length > 0) {
      Speech.speak(messages[0].text, {
        onDone: () => setIsSpeaking(false),
      });
      setIsSpeaking(true);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setIsSpeaking(false);
  };

  const renderMessage = ({ item }: any) => (
    <View
      style={[
        styles.messageContainer,
        item.user
          ? styles.userMessageContainer
          : { backgroundColor, alignSelf: "flex-start" },
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.user ? styles.userMessage : { color: textColor },
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "flex-end",
          paddingTop: topPadding,
          paddingBottom: vs(8) + vs(38) + vs(8) + (Platform.OS === "ios" ? 34 : -100),
        }}
      />
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: isIOS ? "transparent" : groupBoxColor,
            borderTopColor: backgroundColor,
            position: "absolute",
            left: 0,
            right: 0,
            bottom: keyboardHeight,
            paddingBottom: inputBottomPadding,
            overflow: "hidden",
          },
        ]}
      >
        {isIOS && (
          <BlurView
            intensity={90}
            tint={blurTint}
            style={StyleSheet.absoluteFill}
          />
        )}
        <View style={styles.inputRow}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: isIOS ? "rgba(255,255,255,0.3)" : backgroundColor }]}
          onPress={toggleSpeech}
        >
          <FontAwesome
            name={isSpeaking ? "microphone-slash" : "microphone"}
            size={ms(20)}
            color={textColor}
          />
        </TouchableOpacity>
        <TextInput
          placeholder="Ask anything..."
          onChangeText={setUserInput}
          value={userInput}
          onSubmitEditing={sendMessage}
          style={[styles.input, { backgroundColor: isIOS ? "rgba(255,255,255,0.25)" : backgroundColor, color: textColor }]}
          placeholderTextColor="#888"
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.iconButton, styles.sendButton]}
          onPress={sendMessage}
          disabled={loading}
        >
          <Entypo name="paper-plane" size={ms(20)} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: isIOS ? "rgba(255,255,255,0.3)" : backgroundColor }]}
          onPress={clearMessages}
        >
          <Entypo name="controller-stop" size={ms(20)} color={textColor} />
        </TouchableOpacity>
        </View>
      </View>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: vs(4),
    marginHorizontal: s(8),
    padding: s(8),
    borderRadius: s(7),
    maxWidth: "80%",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
  },
  messageText: { fontSize: ms(16) },
  userMessage: { color: "white" },
  inputContainer: {
    paddingHorizontal: s(12),
    paddingTop: vs(10),
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    paddingHorizontal: s(14),
    paddingVertical: vs(10),
    borderRadius: ms(22),
    height: vs(44),
    fontSize: ms(16),
    marginHorizontal: s(8),
  },
  iconButton: {
    borderRadius: ms(22),
    height: vs(44),
    width: vs(44),
    justifyContent: "center",
    alignItems: "center",
  },
  sendButton: {
    backgroundColor: ACCENT,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default GeminiChat;
