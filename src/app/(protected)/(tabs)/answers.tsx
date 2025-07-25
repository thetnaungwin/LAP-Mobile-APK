import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import * as Speech from "expo-speech";
import { FontAwesome, Entypo } from "@expo/vector-icons";
import { showMessage } from "react-native-flash-message";
import { getColorScheme } from "../../../config/color";
import { ms, s, vs } from "react-native-size-matters";

const GeminiChat = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { backgroundColor, textColor } = getColorScheme();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY;

  // Correct Gemini REST API endpoint and model name
  const fetchGemini = async (prompt: string) => {
    const apiKey = API_KEY;
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
      />
      <View style={[{ ...styles.inputContainer, backgroundColor }]}>
        <TouchableOpacity style={styles.iconButton} onPress={toggleSpeech}>
          <FontAwesome
            name={isSpeaking ? "microphone-slash" : "microphone"}
            size={ms(22)}
            color="#000"
          />
        </TouchableOpacity>
        <TextInput
          placeholder="Ask anything"
          onChangeText={setUserInput}
          value={userInput}
          onSubmitEditing={sendMessage}
          style={styles.input}
          placeholderTextColor="#7A7A7A"
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: "#007AFF" }]}
          onPress={sendMessage}
          disabled={loading}
        >
          <Entypo name="paper-plane" size={ms(21)} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={clearMessages}>
          <Entypo name="controller-stop" size={ms(22)} color="#000" />
        </TouchableOpacity>
      </View>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </KeyboardAvoidingView>
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
    flexDirection: "row",
    alignItems: "center",
    padding: s(8),
  },
  input: {
    flex: 1,
    padding: s(8),
    backgroundColor: "lightgray",
    borderRadius: 10,
    height: vs(38),
    color: "#000",
    fontSize: ms(16),
    marginHorizontal: s(6),
  },
  iconButton: {
    padding: s(8),
    backgroundColor: "lightgray",
    borderRadius: 25,
    height: vs(38),
    width: s(38),
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default GeminiChat;
