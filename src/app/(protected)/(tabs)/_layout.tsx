import React, { useState } from "react";
import { Link, Tabs } from "expo-router";
import { AntDesign, Feather, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { ms, s } from "react-native-size-matters";
import { useAuth, useUser } from "@clerk/clerk-react";
import { getColorScheme } from "../../../config/color";
import { useDispatch } from "react-redux";
import { logout } from "../../../store/slices/authSlice";
import { Image, Pressable } from "react-native";
import ModalBox from "../../../component/ModalBox";

const TabLayout = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { backgroundColor } = getColorScheme();
  const dispatch = useDispatch();
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const handleClosePress = () => {
    setShowDiscardModal(true);
  };

  const handleDiscard = async () => {
    setShowDiscardModal(false);
    await signOut();
    dispatch(logout());
  };

  const handleCancel = () => {
    setShowDiscardModal(false);
  };

  return (
    <>
      {/* Logout Modal */}
      <ModalBox
        showDiscardModal={showDiscardModal}
        handleDiscard={handleDiscard}
        handleCancel={handleCancel}
        title="Log out now?"
        BodyText="You’ll be signed out and returned to the login screen."
        btnActionText="Log Out"
        btnCancelText="Cancel"
      />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#FF5700",
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
          headerStyle: { backgroundColor: backgroundColor },
          tabBarStyle: { backgroundColor, borderTopColor: backgroundColor },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "LAP",
            headerTitle: "LAP",
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
          options={{
            title: "Answers",
            headerTintColor: "#FF5700",
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="airbnb" size={ms(24)} color={color} />
            ),
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
    </>
  );
};

export default TabLayout;
