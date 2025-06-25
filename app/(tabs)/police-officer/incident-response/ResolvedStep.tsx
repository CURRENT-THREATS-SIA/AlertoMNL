import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme, useTheme } from '../../../context/ThemeContext';

export default function ResolvedStep() {
  const router = useRouter();
  const { alert_id } = useLocalSearchParams();
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  const buttonColor = isDarkMode ? currentTheme.iconBackground : '#E02323';

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.mapPlaceholder, { backgroundColor: currentTheme.cardBackground }]}>
        <Text style={[styles.mapText, { color: currentTheme.subtitle }]}>[Map with incident location]</Text>
      </View>
      <View style={[styles.infoCard, { backgroundColor: currentTheme.cardBackground }]}>
        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#222' }]}>Crime Responded</Text>
        <Text style={[styles.instructions, { color: isDarkMode ? currentTheme.subtitle : '#333' }]}>
          The threat has been neutralized and the scene is secure. Please collect evidence and prepare your final report.
        </Text>
        <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#222' }]}>Reported</Text>
        <Text style={[styles.value, { color: isDarkMode ? currentTheme.subtitle : '#444' }]}>9:35 PM</Text>
        <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#222' }]}>Victim's Information</Text>
        <Text style={[styles.value, { color: isDarkMode ? currentTheme.subtitle : '#444' }]}>Juan Dela Cruz (0917883247)</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: buttonColor }]} onPress={() => router.push(`/police-officer/incident-response/ReportStep?alert_id=${alert_id}`)}>
          <Text style={[styles.buttonText, { color: '#fff' }]}>Submit Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mapText: {},
  infoCard: { padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 8 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  instructions: { fontSize: 14, marginBottom: 16 },
  label: { fontSize: 14, marginTop: 12 },
  value: { fontSize: 16, fontWeight: 'bold' },
  button: { marginTop: 24, borderRadius: 8, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
}); 