import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MapStep() {
  const router = useRouter();
  const { alert_id } = useLocalSearchParams();

  // TODO: Replace with real data and map component
  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>[Map with route to incident]</Text>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.label}>Location</Text>
        <Text style={styles.value}>Tondo, Manila (District 1)</Text>
        <Text style={styles.label}>Estimated Time Arrival</Text>
        <Text style={styles.value}>15 minutes</Text>
        <Text style={styles.label}>Reported</Text>
        <Text style={styles.value}>9:35 PM</Text>
        <Text style={styles.label}>Victim's Information</Text>
        <Text style={styles.value}>Juan Dela Cruz (0917883247)</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push(`/police-officer/incident-response/ArrivedStep?alert_id=${alert_id}`)}>
          <Text style={styles.buttonText}>You've Arrived</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  mapPlaceholder: { flex: 1, backgroundColor: '#e5e5e5', justifyContent: 'center', alignItems: 'center' },
  mapText: { color: '#666' },
  infoCard: { padding: 24, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 8 },
  label: { color: '#888', fontSize: 14, marginTop: 12 },
  value: { color: '#111', fontSize: 16, fontWeight: 'bold' },
  button: { marginTop: 24, backgroundColor: '#E02323', borderRadius: 8, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
}); 