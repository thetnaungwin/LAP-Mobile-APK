import { Redirect, Slot } from "expo-router";
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";

export default function AuthLayout() {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  if (isLoggedIn) {
    <Redirect href={"/"} />;
  }

  return <Slot />;
}
