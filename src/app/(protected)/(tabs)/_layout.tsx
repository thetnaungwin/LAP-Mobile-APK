import React from "react";
import { Tabs } from "expo-router";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { ms, s } from "react-native-size-matters";
import { useAuth } from "@clerk/clerk-react";
import { getColorScheme } from "../../../config/color";
import { useDispatch } from "react-redux";
import { logout } from "../../../store/slices/authSlice";
import { TouchableOpacity } from "react-native";

const TabLayout = () => {
  const { signOut } = useAuth();
  const { backgroundColor } = getColorScheme();
  const dispatch = useDispatch();

  const logOutPressed = async () => {
    await signOut();
    dispatch(logout());
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FF5700",
        headerRight: () => (
          <TouchableOpacity onPress={logOutPressed}>
            <Feather
              name="log-out"
              size={ms(22)}
              color="#FF5700"
              style={{ paddingRight: s(10) }}
            />
          </TouchableOpacity>
        ),
        headerStyle: { backgroundColor: backgroundColor },
        tabBarStyle: { backgroundColor, borderTopColor: backgroundColor },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: "LAPHome",
          headerTintColor: "#FF5700",
          tabBarIcon: ({ color }) => (
            <AntDesign name="home" size={ms(24)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerTintColor: "#FF5700",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={ms(24)}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="communities"
        options={{
          title: "Communities",
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
        name="inbox"
        options={{
          title: "Inbox",
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
