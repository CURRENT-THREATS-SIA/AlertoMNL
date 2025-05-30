import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" />
      <Stack.Screen name="SignUp" />
      <Stack.Screen name="Permissions" />
      <Stack.Screen name="Permissions1" />
      <Stack.Screen name="TermsAndCondition" />
      <Stack.Screen name="index" />
      <Stack.Screen name="index2" />
    </Stack>
  );
} 