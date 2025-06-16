import { Stack } from "expo-router";
import { View } from "react-native";
import { theme, useTheme } from "../../context/ThemeContext";

export default function PoliceOfficerLayout() {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: currentTheme.background },
        }}
      >
        <Stack.Screen name="Home" />
        <Stack.Screen name="History" />
        <Stack.Screen name="Profile" />
        <Stack.Screen name="settings" />
        <Stack.Screen 
          name="settings/app-permissions" 
          options={{
            presentation: 'modal',
            contentStyle: { backgroundColor: currentTheme.background }
          }}
        />
        <Stack.Screen 
          name="settings/privacy-policy" 
          options={{
            presentation: 'modal',
            contentStyle: { backgroundColor: currentTheme.background }
          }}
        />
        <Stack.Screen 
          name="settings/about" 
          options={{
            presentation: 'modal',
            contentStyle: { backgroundColor: currentTheme.background }
          }}
        />
        <Stack.Screen name="Notifications" />
        <Stack.Screen name="incident-response/MapStep" />
        <Stack.Screen name="incident-response/ArrivedStep" />
        <Stack.Screen name="incident-response/ResolvedStep" />
        <Stack.Screen name="incident-response/ReportStep" />
        <Stack.Screen name="incident-response/index" />
      </Stack>
    </View>
  );
}