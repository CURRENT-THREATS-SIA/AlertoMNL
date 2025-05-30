import { Stack } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="police-officer" />
      <Stack.Screen name="regular-user" />
    </Stack>
  );
} 