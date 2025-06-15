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

  const handleSelectIncidentType = (type: string) => {
    setIncidentType(type);
    setIsDropdownOpen(false);
  }

  return (
    <View style={styles.container}>
      {/* Centered Header is preserved */}
      <View style={styles.centeredHeaderWrapper}>
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
          <Text style={styles.title}>Incident data</Text>
          <Text style={styles.subtitle}>Provide details exactly as you observed at the scene</Text>
          
          {/* --- This is the new Dropdown UI --- */}
          <Text style={styles.label}>Incident Type</Text>
          <TouchableOpacity style={styles.dropdownPicker} onPress={() => setIsDropdownOpen(true)}>
              <Text style={[styles.dropdownPickerText, incidentType ? styles.dropdownPickerTextSelected : {}]}>
                  {incidentType || 'Choose Incident Type'}
              </Text>
              <DropdownArrowIcon />
          </TouchableOpacity>

          <Text style={styles.label}>Severity Level</Text>
          <View style={styles.radioGroupVertical}>
            {['Low', 'Medium', 'High'].map(level => (
              <TouchableOpacity
                key={level}
                style={styles.radioItemVertical}
                onPress={() => setSeverity(level)}
              >
                <View style={[styles.radioCircle, severity === level && styles.radioCircleSelected]}>
                    {/* This inner view is only used for the non-solid circle style */}
                    {/* For the solid style, we only need the background color on the parent */}
                </View>
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
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Incident Type</Text>
                        </View>
                        {incidentTypes.map(type => (
                            <TouchableOpacity key={type} style={styles.modalItem} onPress={() => handleSelectIncidentType(type)}>
                                <Text style={styles.modalItemText}>{type}</Text>
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
  container: { flex: 1, backgroundColor: '#fff' },
  centeredHeaderWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24, 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#111', 
    marginBottom: 4, 
    marginTop: 24, 
    textAlign: 'left' 
  },
  subtitle: { color: '#888', fontSize: 16, marginBottom: 24, textAlign: 'left' },
  label: { color: '#333', fontSize: 16, fontWeight: '500', marginBottom: 12 },
  
  // New Dropdown Styles
  dropdownPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 12,
    marginBottom: 24,
  },
  dropdownPickerText: {
    color: '#888',
    fontSize: 16,
  },
  dropdownPickerTextSelected: {
    color: '#111',
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
    borderColor: '#E02323', // <-- Color restored to red
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  radioCircleSelected: { 
      backgroundColor: '#E02323', // <-- This now fills the entire circle
      borderWidth: 0, // No border needed when filled
  },
  radioLabel: { color: '#333', fontSize: 16 },
  input: { 
      borderWidth: 1, 
      borderColor: '#ccc', 
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
    backgroundColor: '#E02323', 
    borderRadius: 12, 
    paddingVertical: 18, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // --- Styles updated for slide-up animation ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end', // Aligns modal to the bottom
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16, // Rounded corners for the slide-up panel
    borderTopRightRadius: 16,
    width: '100%',
    paddingBottom: 20, // Padding at the bottom of the list
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    textAlign: 'center',
  }
});
