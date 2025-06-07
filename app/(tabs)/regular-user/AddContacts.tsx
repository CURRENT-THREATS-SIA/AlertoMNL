import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { fonts } from '../../config/fonts';

interface FormField {
  id: string;
  label: string;
  placeholder: string;
}

const formFields: FormField[] = [
  { id: "name", label: "Name", placeholder: "Enter full name of contact" },
  {
    id: "phone",
    label: "Phone Number",
    placeholder: "Enter phone number of contact",
  },
  {
    id: "email",
    label: "Email Address",
    placeholder: "Enter email address of contact",
  },
  {
    id: "relationship",
    label: "Relationship",
    placeholder: "Enter relationship to you",
  },
];

const relationshipOptions = [
  'Parent',
  'Sibling',
  'Spouse',
  'Child',
  'Relative',
  'Friend',
  'Other',
];

const AddContacts: React.FC = () => {
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [customRelationship, setCustomRelationship] = useState('');

  const handleSave = async () => {
    const relValue = relationship === 'Other' ? customRelationship : relationship;
    if (!name || !phone || !relValue) {
      Alert.alert('Please fill all required fields.');
      return;
    }
    if (!/^09\d{9}$/.test(phone)) {
      Alert.alert('Philippine mobile number must be exactly 11 digits and must start with 09 (e.g., 09062278962).');
      return;
    }
    const nuser_id = await AsyncStorage.getItem('nuser_id');
    if (!nuser_id) {
      Alert.alert('User not found. Please log in again.');
      return;
    }
    const response = await fetch('http://mnl911.atwebpages.com/add_contact1.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `nuser_id=${nuser_id}&contact_name=${encodeURIComponent(name)}&contact_number=${encodeURIComponent(phone)}&relationship=${encodeURIComponent(relValue)}`
    });
    const data = await response.json();
    if (data.success) {
      Alert.alert('Contact added!');
      router.back();
    } else {
      Alert.alert(data.message || "Failed to add contact");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Form Title */}
          <Text style={styles.title}>Add Number</Text>

          {/* User Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={41} color="#e33c3c" />
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <View style={styles.fieldContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter full name of contact"
                placeholderTextColor="#7e7e7e"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={styles.fieldContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number of contact"
                placeholderTextColor="#7e7e7e"
                value={phone}
                onChangeText={text => setPhone(text.replace(/[^0-9]/g, ''))} // Only numbers
                keyboardType="number-pad"
                maxLength={11} // Prevents typing more than 11 digits
              />
            </View>
            <View style={styles.fieldContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Relationship</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <View style={{ backgroundColor: 'white', borderRadius: 10, width: '100%' }}>
                <Picker
                  selectedValue={relationship}
                  onValueChange={(itemValue: string) => {
                    setRelationship(itemValue);
                    if (itemValue !== 'Other') setCustomRelationship('');
                  }}
                  style={styles.picker}
                  dropdownIconColor="#e33c3c"
                >
                  <Picker.Item label="Select Relationship" value="" />
                  {relationshipOptions.map(option => (
                    <Picker.Item key={option} label={option} value={option} />
                  ))}
                </Picker>
              </View>
              {relationship === 'Other' && (
                <TextInput
                  style={[styles.input, { marginTop: 8 }]}
                  placeholder="Please specify"
                  placeholderTextColor="#7e7e7e"
                  value={customRelationship}
                  onChangeText={setCustomRelationship}
                />
              )}
            </View>
          </View>

          {/* Buttons Container */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={[styles.buttonText, styles.saveButtonText]}>Save Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
  },
  content: {
    flex: 1,
    gap: 26,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.poppins.semiBold,
    color: '#7d7d7d',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#f66e6e9c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    gap: 8,
  },
  fieldContainer: {
    gap: 10,
  },
  labelContainer: {
    flexDirection: 'row',
  },
  label: {
    fontFamily: fonts.poppins.semiBold,
    fontSize: 12,
    color: '#000712',
  },
  required: {
    fontFamily: fonts.poppins.semiBold,
    fontSize: 12,
    color: '#e02323',
  },
  input: {
    height: 42,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontFamily: fonts.poppins.medium,
    fontSize: 12,
    color: '#000000',
  },
  picker: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '#000000',
    width: '100%',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  button: {
    flex: 1,
    height: 40,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#e33c3c',
  },
  cancelButtonText: {
    color: '#e33c3c',
  },
  saveButton: {
    backgroundColor: '#e33c3c',
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
});

export default AddContacts; 