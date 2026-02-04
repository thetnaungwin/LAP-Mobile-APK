import { Platform } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Returns top padding so tab screen content is not covered by the transparent (glass) header on iOS.
 * Returns 0 on Android.
 */
export function useTabHeaderPadding(): number {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  if (Platform.OS !== "ios") return 0;
  return insets.top + 30;
}
