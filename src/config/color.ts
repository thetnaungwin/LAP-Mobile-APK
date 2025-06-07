import { useColorScheme } from "react-native";

export const Colors = {
  light: {
    text: "#000000",
    background: "#E8E8F0",
    barStyle: "dark-content",
    groupNameText: "#3A3B3C",
    modalBg: "#FFFFFF",
    primary: "#007FFF",
    // primary: "#3978ab",
    // primary: "#66DEFF",
    green: "#90EE90",
    btnColor: "#000000",
    error: "#FF0000",
  },
  dark: {
    text: "#FFFFFF",
    background: "#1E1E1E",
    barStyle: "light-content",
    groupNameText: "#FFF",
    modalBg: "#0B1215",
    primary: "#007FFF",
    // primary: "#3978ab",
    // primary: "#66DEFF",
    green: "#90EE90",
    btnColor: "#FFFFFF",
    error: "#FF0000",
  },
};

export function getColorScheme() {
  const colorScheme = useColorScheme();

  const backgroundColor = Colors[colorScheme ?? "light"].background;

  const textColor = Colors[colorScheme ?? "light"].text;

  const barStyle = Colors[colorScheme ?? "light"].barStyle;

  const groupNameText = Colors[colorScheme ?? "light"].groupNameText;

  const modalBg = Colors[colorScheme ?? "light"].modalBg;

  const btnColor = Colors[colorScheme ?? "light"].btnColor;

  return {
    backgroundColor,
    textColor,
    barStyle,
    groupNameText,
    modalBg,
    btnColor,
  };
}
