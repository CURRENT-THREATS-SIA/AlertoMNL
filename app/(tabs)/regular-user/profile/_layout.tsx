import { Stack } from "expo-router";
import { View } from "react-native";
import { theme, useTheme } from "../../../context/ThemeContext";

export default function ProfileLayout() {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: currentTheme.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="accountDetails" />
        <Stack.Screen name="setUpSOS" />
        <Stack.Screen name="voiceRecords" />
        <Stack.Screen name="appPermission" />
        <Stack.Screen name="privacyPolicy" />
        <Stack.Screen name="about" />
      </Stack>
    </View>
  );
} 