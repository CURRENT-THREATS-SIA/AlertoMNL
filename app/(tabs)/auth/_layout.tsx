import { Stack } from "expo-router";
import AuthGate from "./AuthGate"; // adjust path if needed

export default function AuthLayout() {
  return (
    <AuthGate>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" />
        <Stack.Screen name="SignUp" />
        <Stack.Screen name="Permissions" />
        <Stack.Screen name="Permissions1" />
        <Stack.Screen name="TermsAndCondition" />
        <Stack.Screen name="index" />
        <Stack.Screen name="index2" />
      </Stack>
    </AuthGate>
  );
}