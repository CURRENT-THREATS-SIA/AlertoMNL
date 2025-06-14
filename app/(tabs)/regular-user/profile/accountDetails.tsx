import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { fonts } from '../../../config/fonts';

interface UserData {
  label: string;
  value: string;
  key: string;
  isPassword?: boolean;
}

const AccountDetails: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isEditing, setIsEditing] = React.useState(false);
  const [originalData, setOriginalData] = React.useState<UserData[]>([
    { label: "First Name", value: "", key: "firstName" },
    { label: "Last Name", value: "", key: "lastName" },
    { label: "Email Address", value: "", key: "email" },
    { label: "Phone Number", value: "", key: "phone" },
    { label: "Password", value: "••••••••", key: "password", isPassword: true },
  ]);
  const [editableData, setEditableData] = useState<UserData[]>([...originalData]);

  useEffect(() => {
    const loadUserData = async () => {
      const firstName = await AsyncStorage.getItem('firstName');
      const lastName = await AsyncStorage.getItem('lastName');
      const email = await AsyncStorage.getItem('email');
      const phone = await AsyncStorage.getItem('phone');
      setOriginalData([
        { label: "First Name", value: firstName || "", key: "firstName" },
        { label: "Last Name", value: lastName || "", key: "lastName" },
        { label: "Email Address", value: email || "", key: "email" },
        { label: "Phone Number", value: phone || "", key: "phone" },
        { label: "Password", value: "••••••••", key: "password", isPassword: true },
      ]);
      setEditableData([
        { label: "First Name", value: firstName || "", key: "firstName" },
        { label: "Last Name", value: lastName || "", key: "lastName" },
        { label: "Email Address", value: email || "", key: "email" },
        { label: "Phone Number", value: phone || "", key: "phone" },
        { label: "Password", value: "••••••••", key: "password", isPassword: true },
      ]);
    };
    loadUserData();
  }, []);

  const handleInputChange = (text: string, key: string) => {
    setEditableData(prevData =>
      prevData.map(field =>
        field.key === key ? { ...field, value: text } : field
      )
    );
  };

  const handleSave = async () => {
    setOriginalData([...editableData]);
    setIsEditing(false);
  
    // Save updated info to AsyncStorage
    let userData: { [key: string]: string } = {};
    for (const field of editableData) {
      if (field.key !== "password") {
        await AsyncStorage.setItem(field.key, field.value);
        userData[field.key] = field.value;
      }
    }
  
    // Get nuser_id from AsyncStorage
    const nuser_id = await AsyncStorage.getItem('nuser_id');
  
    // Send update to backend
    try {
      const response = await fetch('http://mnl911.atwebpages.com/update_profile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `nuser_id=${encodeURIComponent(nuser_id || "")}&firstName=${encodeURIComponent(userData.firstName || "")}&lastName=${encodeURIComponent(userData.lastName || "")}&email=${encodeURIComponent(userData.email || "")}&phone=${encodeURIComponent(userData.phone || "")}`
      });
      const data = await response.json();
      if (data.success) {
        alert("Profile updated successfully!");
      } else {
        alert(data.message || "Update failed");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    }
  };

  const startEditing = () => {
    setEditableData([...originalData]);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditableData([...originalData]);
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Details</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={40} color="#e02323" />
          </View>
          {isEditing && (
            <TouchableOpacity style={styles.editAvatarButton}>
              <Text style={styles.editAvatarText}>Change Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {editableData.map((field) => (
            <View key={field.key} style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{field.label}</Text>
              <TextInput
                style={[
                  styles.input,
                  !isEditing && styles.inputDisabled
                ]}
                value={field.value}
                onChangeText={(text) => handleInputChange(text, field.key)}
                editable={isEditing && !field.isPassword}
                secureTextEntry={field.isPassword}
                placeholderTextColor="#666666"
              />
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={startEditing}
            >
              <Text style={styles.saveButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    paddingBottom: 12,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.poppins.semiBold,
    color: '#212121',
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#ffd1d1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarButton: {
    marginTop: 8,
    padding: 8,
  },
  editAvatarText: {
    color: '#e02323',
    fontFamily: fonts.poppins.medium,
    fontSize: 14,
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    position: 'absolute',
    top: -8,
    left: 12,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 4,
    fontSize: 12,
    color: '#666666',
    fontFamily: fonts.poppins.regular,
    zIndex: 1,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#15050266',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: fonts.poppins.regular,
    color: '#212121',
    backgroundColor: '#ffffff',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#666666',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    paddingHorizontal: 4,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#15050266',
  },
  saveButton: {
    backgroundColor: '#e02323',
  },
  cancelButtonText: {
    color: '#15050266',
    fontFamily: fonts.poppins.semiBold,
    fontSize: 16,
  },
  saveButtonText: {
    color: '#ffffff',
    fontFamily: fonts.poppins.semiBold,
    fontSize: 16,
  },
});

export default AccountDetails;
