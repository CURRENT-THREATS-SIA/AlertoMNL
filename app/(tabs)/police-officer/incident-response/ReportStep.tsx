import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const incidentTypes = [
  'Theft', 'Robbery', 'Assault', 'Homicide', 'Vandalism', 'Drugs', 'Other'
];

export default function ReportStep() {
  const { alert_id } = useLocalSearchParams();
  const router = useRouter();
  const [incidentType, setIncidentType] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    const policeId = await AsyncStorage.getItem('police_id');
    const formData = new FormData();
    formData.append('alert_id', String(alert_id));
    formData.append('police_id', policeId ? policeId : '');
    formData.append('incident_type', incidentType);
    formData.append('severity', severity);
    formData.append('description', description);

    const response = await fetch('http://mnl911.atwebpages.com/resolve_sos_alert.php', {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    if (result.success) {
      alert('Incident report submitted!');
      router.replace('/police-officer');
    } else {
      alert(result.error || 'Failed to submit report.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Incident data</Text>
      <Text style={styles.subtitle}>Provide details exactly as you observed at the scene</Text>
      <Text style={styles.label}>Incident Type</Text>
      <View style={styles.dropdown}>
        {incidentTypes.map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.dropdownItem, incidentType === type && styles.dropdownItemSelected]}
            onPress={() => setIncidentType(type)}
          >
            <Text style={incidentType === type ? styles.dropdownTextSelected : styles.dropdownText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Severity Level</Text>
      <View style={styles.radioGroup}>
        {['Low', 'Medium', 'High'].map(level => (
          <TouchableOpacity
            key={level}
            style={styles.radioItem}
            onPress={() => setSeverity(level)}
          >
            <View style={[styles.radioCircle, severity === level && styles.radioCircleSelected]} />
            <Text style={styles.radioLabel}>{level}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        placeholder="Add additional information"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Details</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#E02323', marginBottom: 8 },
  subtitle: { color: '#888', fontSize: 14, marginBottom: 16 },
  label: { color: '#888', fontSize: 14, marginTop: 12 },
  dropdown: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 },
  dropdownItem: { padding: 8, borderRadius: 6, backgroundColor: '#eee', marginRight: 8, marginBottom: 8 },
  dropdownItemSelected: { backgroundColor: '#E02323' },
  dropdownText: { color: '#333' },
  dropdownTextSelected: { color: '#fff', fontWeight: 'bold' },
  radioGroup: { flexDirection: 'row', marginVertical: 8 },
  radioItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  radioCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#E02323', marginRight: 6 },
  radioCircleSelected: { backgroundColor: '#E02323' },
  radioLabel: { color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, minHeight: 60, marginTop: 8, marginBottom: 16 },
  button: { marginTop: 24, backgroundColor: '#E02323', borderRadius: 8, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
}); 