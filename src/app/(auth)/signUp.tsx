import * as React from "react";
import {
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { getColorScheme } from "../../config/color";
import { ms, vs, s } from "react-native-size-matters";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { setLoggedIn } from "../../store/slices/authSlice";
import { useDispatch } from "react-redux";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const dispatch = useDispatch();

  const [emailAddress, setEmailAddress] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [pendingVerification, setPendingVerification] =
    useState<boolean>(false);
  const [code, setCode] = useState<string>("");
  const [secureText, setSecureText] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [wrongPassword, setWrongPassword] = useState<boolean>(false);
  const [identifier, setIdentifier] = useState<boolean>(false);
  const [invalidUsername, setInvalidUsername] = useState<boolean>(false);
  const [wrongOTP, setWrongOTP] = useState<boolean>(false);

  const { backgroundColor, textColor, barStyle } = getColorScheme();
  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setWrongPassword(false);
    setIdentifier(false);
    setInvalidUsername(false);

    try {
      await signUp.create({
        emailAddress,
        password,
        username,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
      setLoading(false);
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.log(JSON.stringify(err, null, 2));

      const errorObject = typeof err === "string" ? JSON.parse(err) : err;
      const paramNames =
        errorObject.errors?.map((error: any) => error.meta?.paramName) || [];

      // Reset all error states
      setWrongPassword(false);
      setIdentifier(false);
      setInvalidUsername(false);

      // Set error state for each field that failed
      paramNames.forEach((param: string) => {
        if (param === "password") setWrongPassword(true);
        if (param === "email_address") setIdentifier(true);
        if (param === "username") setInvalidUsername(true);
      });

      setLoading(false);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    setWrongOTP(false);
    setLoading(true);

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });

        // --- Add user to Supabase users table ---
        await fetch("https://iybbljbbacqumygotpbl.supabase.co/rest/v1/users", {
          method: "POST",
          headers: {
            apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify([
            {
              user_id: signUpAttempt.createdUserId,
              user_name: username,
            },
          ]),
        })
          .then((res) => res.json())
          .then(console.log)
          .catch(console.error);
        // --- End add user ---

        router.replace("/");
        dispatch(setLoggedIn(true));
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.log(JSON.stringify(signUpAttempt, null, 2));
      }
      setLoading(false);
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.log(JSON.stringify(err, null, 2));

      const errorObject = typeof err === "string" ? JSON.parse(err) : err;
      const message = errorObject?.errors?.[0]?.message;
      if (message == "is incorrect" || "failed") setWrongOTP(true);
      if (!code) setWrongOTP(true);
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor }}
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

            <Text style={[styles.title, { color: textColor }]}>
              Verify Your Email
            </Text>

            <Text
              style={[styles.label, { color: textColor, marginBottom: vs(10) }]}
            >
              Enter the 6-digit code sent to your email.
            </Text>

            <TextInput
              style={[
                {
                  ...styles.input,
                  backgroundColor: wrongOTP ? "#FF5733" : "#F0F2F5",
                },
              ]}
              value={code}
              placeholder="Enter verification code"
              placeholderTextColor="#aaa"
              onChangeText={setCode}
              keyboardType="numeric"
            />

            {loading ? (
              <View>
                <ActivityIndicator size="large"></ActivityIndicator>
              </View>
            ) : (
              <TouchableOpacity style={styles.button} onPress={onVerifyPress}>
                <Text style={styles.buttonText}>Verify</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.footerText}>
              Copyright © Lucky and Power 2025-2026. LAP Test (v.0.0.01)
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

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

          <Text style={[{ ...styles.title, color: textColor }]}>Sign Up</Text>

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

          <Text style={[{ ...styles.label, color: textColor }]}>Username</Text>
          <TextInput
            style={[
              {
                ...styles.input,
                backgroundColor: invalidUsername ? "#FF5733" : "#F0F2F5",
              },
            ]}
            placeholder="Enter username"
            placeholderTextColor="#aaa"
            value={username}
            onChangeText={setUsername}
          />

          <Text style={[{ ...styles.label, color: textColor }]}>Password</Text>
          <View
            style={[
              {
                ...styles.passwordContainer,
                backgroundColor: wrongPassword ? "#FF5733" : "#F0F2F5",
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

          {loading ? (
            <View>
              <ActivityIndicator size="large"></ActivityIndicator>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => onSignUpPress()}
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.footerText}>
            Copyright © Lucky and Power 2025-2026. LAP Test (v.0.0.01)
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
    marginBottom: vs(25),
  },
  passwordInput: {
    flex: 1,
    fontSize: ms(16),
  },
  eyeIcon: {
    padding: s(6),
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
  footerText: {
    marginTop: vs(20),
    fontSize: ms(12),
    textAlign: "center",
    color: "#666",
  },
});
