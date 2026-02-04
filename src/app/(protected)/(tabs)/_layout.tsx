import React from "react";
import { Link, Tabs } from "expo-router";
import { AntDesign, Feather, FontAwesome5 } from "@expo/vector-icons";
import { ms, s } from "react-native-size-matters";
import { useUser } from "@clerk/clerk-react";
import { getColorScheme } from "../../../config/color";
import { Image, Platform, Pressable, StyleSheet, TouchableOpacity, useColorScheme } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";

const TabLayout = () => {
  const { user } = useUser();
  const { backgroundColor, textColor } = getColorScheme();
  const colorScheme = useColorScheme();
  const isIOS = Platform.OS === "ios";
  const blurTint = colorScheme === "dark" ? "dark" : "light";

  // On iOS, position: 'absolute' is required for BlurView to work (content must scroll behind the bar)
  const tabBarStyle = isIOS
    ? {
        position: "absolute" as const,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "transparent",
        borderTopWidth: 0,
      }
    : { backgroundColor, borderTopWidth: 0 };

  const headerStyle = isIOS
    ? { backgroundColor: "transparent" }
    : { backgroundColor };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FF5700",
        tabBarStyle,
        ...(isIOS && {
          tabBarBackground: () => (
            <BlurView
              intensity={90}
              tint={blurTint}
              style={[StyleSheet.absoluteFill, { overflow: "hidden" }]}
            />
          ),
          headerTransparent: true,
          headerBackground: () => (
            <BlurView
              intensity={80}
              tint={blurTint}
              style={StyleSheet.absoluteFill}
            />
          ),
        }),
        headerStyle,
        headerRight: () => (
          <Link href={"Profile"} asChild>
            <Pressable>
              {user?.imageUrl ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  style={{
                    width: ms(32),
                    height: ms(32),
                    borderRadius: ms(16),
                    marginRight: s(10),
                  }}
                />
              ) : (
                <AntDesign
                  name="user"
                  size={ms(28)}
                  color="#FF5700"
                  style={{ marginRight: s(10) }}
                />
              )}
            </Pressable>
          </Link>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "LAP",
          headerTitleAlign:"left",
          headerTitle: "LAP",
          headerTintColor: "#FF5700",
          tabBarIcon: ({ color }) => (
            <AntDesign name="home" size={ms(24)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="communities"
        options={{
          title: "Communities",
          headerTitleAlign:"left",
          headerTintColor: "#FF5700",
          tabBarIcon: ({ color }) => (
            <Feather name="users" size={ms(24)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ color }) => (
            <AntDesign name="plus" size={ms(24)} color={color} />
          ),
          headerShown: false,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="answers"
        options={({ navigation }) => ({
          headerTitle: () => (
            <TouchableOpacity
              style={{ flexDirection: "row", gap: 10 }}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={ms(24)} color={textColor} />
            </TouchableOpacity>
          ),
          headerTitleAlign: "left",
          headerTintColor: "#FF5700",
          tabBarStyle: { display: "none" },
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="airbnb" size={24} color={color} />
          ),
          // Ensure glass header on iOS (same as other tabs)
          ...(isIOS && {
            headerTransparent: true,
            headerBackground: () => (
              <BlurView
                intensity={80}
                tint={blurTint}
                style={StyleSheet.absoluteFill}
              />
            ),
          }),
        })}
      />

      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          headerTitleAlign:"left",
          headerTintColor: "#FF5700",
          tabBarIcon: ({ color }) => (
            <Feather name="bell" size={ms(24)} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
