import { Stack } from "expo-router";
import React from "react";
import { View } from "react-native";
import { theme, useTheme } from "../context/ThemeContext";

export default function TabLayout() {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: currentTheme.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="guest" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="police-officer" />
        <Stack.Screen name="regular-user" />
      </Stack>
    </View>
  );
} 