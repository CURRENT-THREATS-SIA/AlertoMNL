import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity, // <-- Import Modal
  TouchableWithoutFeedback // <-- Import TouchableWithoutFeedback
  ,









  View
} from 'react-native';
import { Path, Svg } from 'react-native-svg'; // <-- Import Svg for the dropdown arrow
import Header from '../../../../components/Header';
import { theme, useTheme } from '../../../context/ThemeContext';

const incidentTypes = [
  'Theft', 'Robbery', 'Assault', 'Homicide', 'Vandalism', 'Drugs', 'Other'
];

// --- Reusable Dropdown Arrow Icon ---
const DropdownArrowIcon = () => (
    <Svg height="24" width="24" viewBox="0 0 24 24">
        <Path d="M7 10l5 5 5-5z" fill="#888" />
    </Svg>
);

export default function ReportStep() {
  const { alert_id } = useLocalSearchParams();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  const buttonColor = isDarkMode ? currentTheme.iconBackground : '#E02323';
  const [incidentType, setIncidentType] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [description, setDescription] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for the modal

  const handleSubmit = async () => {
    // Basic validation
    if (!incidentType) {
        alert('Please select an incident type.');
        return;
    }
    if (!description) {
        alert('Please provide a description for the incident.');
        return;
    }

    const policeId = await AsyncStorage.getItem('police_id');
    const formData = new FormData();
    formData.append('alert_id', String(alert_id));
    formData.append('police_id', policeId ? policeId : '');
    formData.append('incident_type', incidentType);
    formData.append('severity', severity);
    formData.append('description', description);
    formData.append('action', 'resolve');

    const response = await fetch('http://mnl911.atwebpages.com/status.php', {
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

  const handleSelectIncidentType = (type: string) => {
    setIncidentType(type);
    setIsDropdownOpen(false);
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Centered Header is preserved */}
      <View style={[styles.centeredHeaderWrapper, { backgroundColor: currentTheme.cardBackground, borderBottomColor: currentTheme.border }]}>
        <Header showNotification={false} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#222' }]}>Incident data</Text>
          <Text style={[styles.subtitle, { color: isDarkMode ? currentTheme.subtitle : '#333' }]}>Provide details exactly as you observed at the scene</Text>
          
          {/* --- This is the new Dropdown UI --- */}
          <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#222' }]}>Incident Type</Text>
          <TouchableOpacity style={[styles.dropdownPicker, { borderBottomColor: currentTheme.border }]} onPress={() => setIsDropdownOpen(true)}>
              <Text style={[styles.dropdownPickerText, incidentType ? { color: isDarkMode ? '#fff' : '#222' } : { color: isDarkMode ? currentTheme.subtitle : '#888' }]}>
                  {incidentType || 'Choose Incident Type'}
              </Text>
              <DropdownArrowIcon />
          </TouchableOpacity>

          <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#222' }]}>Severity Level</Text>
          <View style={styles.radioGroupVertical}>
            {['Low', 'Medium', 'High'].map(level => (
              <TouchableOpacity
                key={level}
                style={styles.radioItemVertical}
                onPress={() => setSeverity(level)}
              >
                <View style={[styles.radioCircle, { borderColor: currentTheme.iconBackground }, severity === level && { backgroundColor: currentTheme.iconBackground, borderWidth: 0 }]} />
                <Text style={[styles.radioLabel, { color: isDarkMode ? '#fff' : '#222' }]}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#222' }]}>Description</Text>
          <TextInput
            style={[styles.input, { borderColor: currentTheme.border, color: isDarkMode ? '#fff' : '#222', backgroundColor: currentTheme.cardBackground }]}
            placeholder="Add additional information"
            placeholderTextColor={isDarkMode ? currentTheme.subtitle : '#888'}
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TouchableOpacity style={[styles.button, { backgroundColor: buttonColor }]} onPress={handleSubmit}>
            <Text style={[styles.buttonText, { color: '#fff' }]}>Submit Details</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

        {/* --- Dropdown Modal with new slide animation --- */}
        <Modal
            transparent={true}
            visible={isDropdownOpen}
            animationType="slide" 
            onRequestClose={() => setIsDropdownOpen(false)}
        >
            <TouchableWithoutFeedback onPress={() => setIsDropdownOpen(false)}>
                <View style={[styles.modalOverlay, { backgroundColor: currentTheme.modalOverlay }]}> 
                    <View style={[styles.modalContent, { backgroundColor: currentTheme.cardBackground }]}> 
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: currentTheme.headerText }]}>Select Incident Type</Text>
                        </View>
                        {incidentTypes.map(type => (
                            <TouchableOpacity key={type} style={styles.modalItem} onPress={() => handleSelectIncidentType(type)}>
                                <Text style={[styles.modalItemText, { color: currentTheme.text }]}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centeredHeaderWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24, 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 4, 
    marginTop: 24, 
    textAlign: 'left' 
  },
  subtitle: { fontSize: 16, marginBottom: 24, textAlign: 'left' },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 12 },
  
  // New Dropdown Styles
  dropdownPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 12,
    marginBottom: 24,
  },
  dropdownPickerText: {
    fontSize: 16,
  },
  radioGroupVertical: {
    flexDirection: 'column',
    marginBottom: 12,
  },
  radioItemVertical: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, 
  },
  radioCircle: { 
    width: 22, 
    height: 22, 
    borderRadius: 11, 
    borderWidth: 2, 
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  radioLabel: { fontSize: 16 },
  input: { 
      borderWidth: 1, 
      borderRadius: 8, 
      padding: 12, 
      minHeight: 120, 
      marginTop: 8, 
      marginBottom: 24, 
      fontSize: 16, 
      textAlignVertical: 'top' 
  },
  button: { 
    marginTop: 16, 
    borderRadius: 12, 
    paddingVertical: 18, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    elevation: 8,
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
  },
});
