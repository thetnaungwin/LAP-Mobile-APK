import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useState } from "react";
import { s, vs, ms } from "react-native-size-matters";
import { Feather } from "@expo/vector-icons";
import { getColorScheme } from "../../config/color";
import { useDispatch } from "react-redux";
import { setLoggedIn } from "../../store/slices/authSlice";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const dispatch = useDispatch();

  const [emailAddress, setEmailAddress] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [secureText, setSecureText] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [wrongPassword, setWrongPassword] = useState<boolean>(false);
  const [identifier, setIdentifier] = useState<boolean>(false);

  const { backgroundColor, textColor, barStyle } = getColorScheme();

  // Handle the submission of the sign-in form
  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    // Start the sign-in process using the email and password provided
    setLoading(true);
    setWrongPassword(false);
    setIdentifier(false);
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
        dispatch(setLoggedIn(true));
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.log(JSON.stringify(signInAttempt, null, 2));
      }
      setLoading(false);
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.log(JSON.stringify(err, null, 2));

      const errorObject = typeof err === "string" ? JSON.parse(err) : err;
      const paramName = errorObject?.errors?.[0]?.meta?.paramName;

      if (paramName == "password") {
        setWrongPassword(true);
      } else {
        setIdentifier(true);
      }

      setLoading(false);
    }
  }, [isLoaded, emailAddress, password]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: backgroundColor }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: vs(30) }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <View style={styles.Container}>
          <StatusBar
            barStyle={barStyle as "default"}
            backgroundColor={backgroundColor}
          />
          <Image
            source={require("../../../assets/logo.png")}
            style={styles.illustration}
          />

          <Text style={[{ ...styles.title, color: textColor }]}>Sign In</Text>

          <Text style={[{ ...styles.label, color: textColor }]}>Email</Text>
          <TextInput
            style={[
              {
                ...styles.input,
                backgroundColor: identifier ? "#FF5733" : "#F0F2F5",
              },
            ]}
            placeholder="Enter email"
            placeholderTextColor="#aaa"
            value={emailAddress}
            onChangeText={setEmailAddress}
          />

          <Text style={[{ ...styles.label, color: textColor }]}>Password</Text>
          <View
            style={[
              {
                ...styles.passwordContainer,
                backgroundColor:
                  wrongPassword || identifier ? "#FF5733" : "#F0F2F5",
              },
            ]}
          >
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter password"
              placeholderTextColor="#aaa"
              secureTextEntry={secureText}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setSecureText(!secureText)}
              style={styles.eyeIcon}
            >
              <Feather
                name={secureText ? "eye-off" : "eye"}
                size={ms(20)}
                color="#aaa"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={{ width: "100%" }}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          {loading ? (
            <View>
              <ActivityIndicator size="large"></ActivityIndicator>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => onSignInPress()}
            >
              <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>
          )}

          <View style={styles.createAccount}>
            <Text
              style={[{ ...styles.createText, color: textColor }]}
            >{`Don't have an account?`}</Text>
            <TouchableOpacity onPress={() => router.push("/signUp")}>
              <Text style={[{ ...styles.createText, color: "#42b72a" }]}>
                Create
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>
            {`Copyright © Lucky and Power 2025-2026. LAP Test (v.0.0.01)`}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: s(15),
  },
  illustration: {
    width: s(250),
    height: vs(220),
    resizeMode: "contain",
    marginBottom: vs(10),
  },
  title: {
    fontSize: ms(28),
    fontWeight: "bold",
    marginBottom: vs(10),
  },
  label: {
    alignSelf: "flex-start",
    fontSize: ms(16),
    fontWeight: "600",
    marginBottom: vs(5),
  },
  input: {
    width: "100%",
    height: vs(43),
    borderColor: "#ccc",
    borderWidth: ms(1),
    borderRadius: ms(8),
    paddingHorizontal: s(10),
    marginBottom: vs(15),
    fontSize: ms(16),
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: vs(43),
    borderColor: "#ccc",
    borderWidth: ms(1),
    borderRadius: ms(8),
    paddingHorizontal: s(10),
    marginBottom: vs(15),
  },
  passwordInput: {
    flex: 1,
    fontSize: ms(16),
  },
  eyeIcon: {
    padding: s(6),
  },
  forgotPassword: {
    color: "#1D7AF3",
    fontSize: ms(14),
    marginBottom: vs(15),
    alignSelf: "flex-end",
  },
  button: {
    width: "100%",
    height: vs(43),
    backgroundColor: "#158CF0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: ms(8),
  },
  buttonText: {
    color: "#fff",
    fontSize: ms(18),
    fontWeight: "bold",
  },
  createAccount: {
    flexDirection: "row",
    gap: ms(6),
    marginTop: vs(10),
  },
  createText: {
    fontSize: ms(14),
  },
  footerText: {
    marginTop: vs(20),
    fontSize: ms(12),
    textAlign: "center",
    color: "#666",
  },
});
