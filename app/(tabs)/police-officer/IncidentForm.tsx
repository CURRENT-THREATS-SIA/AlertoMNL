import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface IncidentType {
  value: string;
  label: string;
}

interface SeverityLevel {
  value: string;
  label: string;
}

export const IncidentForm: React.FC = () => {
  const [selectedIncidentType, setSelectedIncidentType] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('low');
  const [description, setDescription] = useState<string>('');

  // Data for incident types
  const incidentTypes: IncidentType[] = [
    { value: 'theft', label: 'Theft' },
    { value: 'assault', label: 'Assault' },
    { value: 'vandalism', label: 'Vandalism' },
    { value: 'other', label: 'Other' },
  ];

  // Data for severity levels
  const severityLevels: SeverityLevel[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Image
          source={{ uri: 'https://c.animaapp.com/mbhoxx5tSvtxxs/img/frame-25.png' }}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Form Content */}
        <View style={styles.formContainer}>
          {/* Incident Data Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Incident data</Text>
            <Text style={styles.sectionSubtitle}>
              Provide details exactly as you observed at the scene
            </Text>
          </View>

          {/* Incident Type */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Incident Type</Text>
            <View style={styles.picker}>
              {incidentTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.pickerItem,
                    selectedIncidentType === type.value && styles.pickerItemSelected,
                  ]}
                  onPress={() => setSelectedIncidentType(type.value)}
                >
                  <Text style={styles.pickerItemText}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Severity Level */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Severity Level</Text>
            <View style={styles.radioGroup}>
              {severityLevels.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={styles.radioButton}
                  onPress={() => setSelectedSeverity(level.value)}
                >
                  <View style={styles.radio}>
                    {selectedSeverity === level.value && (
                      <View style={styles.radioSelected} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>{level.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Add additional Information"
              placeholderTextColor="#979797"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Submit Details</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Indicator */}
      <View style={styles.bottomIndicator}>
        <View style={styles.indicator} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 40 : 16,
  },
  backButton: {
    padding: 8,
  },
  logo: {
    width: 226,
    height: 40,
    marginLeft: 20,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#242630',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#575f6e',
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#242426',
    marginBottom: 8,
  },
  picker: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  pickerItem: {
    padding: 12,
  },
  pickerItemSelected: {
    backgroundColor: '#F5F5F5',
  },
  pickerItemText: {
    fontSize: 14,
    color: '#242426',
  },
  radioGroup: {
    marginTop: 8,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E02323',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E02323',
  },
  radioLabel: {
    fontSize: 14,
    color: '#242426',
  },
  textArea: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    padding: 8,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#E02323',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomIndicator: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 136,
    height: 7,
    backgroundColor: '#A4A4A4',
    borderRadius: 100,
  },
});
