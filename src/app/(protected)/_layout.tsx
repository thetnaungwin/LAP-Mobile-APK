import { Redirect, router, Stack } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { AntDesign } from "@expo/vector-icons";
import { ms } from "react-native-size-matters";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { TouchableOpacity } from "react-native";

export default function AuthHomeLayout() {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  if (!isLoggedIn) {
    return <Redirect href={"/signIn"} />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="GroupSelector" options={{ headerShown: false }} />
      <Stack.Screen
        name="post/[id]"
        options={{
          headerTitle: "",
          headerStyle: { backgroundColor: "#FF5700" },
          animation: "fade",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <AntDesign name="close" size={ms(26)} color={"white"} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="Profile"
        options={{
          animation: "ios_from_right",
          presentation: "transparentModal",
          headerShown: false,
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
