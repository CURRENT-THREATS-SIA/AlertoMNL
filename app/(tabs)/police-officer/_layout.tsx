import { Stack } from "expo-router";

export default function PoliceOfficerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" />
      <Stack.Screen name="History" />
      <Stack.Screen name="Profile" />
      <Stack.Screen name="settings" />
      <Stack.Screen 
        name="settings/app-permissions" 
        options={{
          presentation: 'modal',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="settings/privacy-policy" 
        options={{
          presentation: 'modal',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="settings/about" 
        options={{
          presentation: 'modal',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen name="Notifications" />
    </Stack>
  );
} 