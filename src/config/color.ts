import { useColorScheme } from "react-native";

export const Colors = {
  light: {
    text: "#000000",
    background: "#E8E8F0",
    barStyle: "dark-content",
    groupNameText: "#3A3B3C",
    groupBox: "#FFF",
    modalBg: "#FFFFFF",
    profileModel: "#fff",
  },
  dark: {
    text: "#FFFFFF",
    background: "#1E1E1E",
    barStyle: "light-content",
    groupNameText: "#FFF",
    groupBox: "#23272F",
    modalBg: "#0B1215",
    profileModel: "#2A2A2A",
  },
};

export function getColorScheme() {
  const colorScheme = useColorScheme();

  const backgroundColor = Colors[colorScheme ?? "light"].background;

  const textColor = Colors[colorScheme ?? "light"].text;

  const barStyle = Colors[colorScheme ?? "light"].barStyle;

  const groupNameText = Colors[colorScheme ?? "light"].groupNameText;

  const groupBoxColor = Colors[colorScheme ?? "light"].groupBox;

  const modalBg = Colors[colorScheme ?? "light"].modalBg;

  const profileMdColor = Colors[colorScheme ?? "light"].profileModel;

  return {
    backgroundColor,
    textColor,
    barStyle,
    groupNameText,
    groupBoxColor,
    modalBg,
    profileMdColor,
  };
}
