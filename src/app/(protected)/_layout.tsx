import { Redirect, router, Stack } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { AntDesign, Entypo, MaterialIcons } from "@expo/vector-icons";
import { ms, s } from "react-native-size-matters";
import { View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

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
          animation: "ios_from_left",
          headerLeft: () => (
            <AntDesign
              name="close"
              size={ms(26)}
              color={"white"}
              onPress={() => router.back()}
            />
          ),
        }}
      />
    </Stack>
  );
}
