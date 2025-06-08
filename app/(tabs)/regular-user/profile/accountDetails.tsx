import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { fonts } from '../../../config/fonts';

// Email validation function
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

interface UserData {
  label: string;
  value: string;
  key: string;
  isPassword?: boolean;
}

const fetchProfileFromBackend = async (
  setOriginalData: React.Dispatch<React.SetStateAction<UserData[]>>,
  setEditableData: React.Dispatch<React.SetStateAction<UserData[]>>,
  setIsLockedOut: React.Dispatch<React.SetStateAction<boolean>>,
  setLockoutUntil: React.Dispatch<React.SetStateAction<number | null>>,
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const nuser_id = await AsyncStorage.getItem('nuser_id');
  if (!nuser_id) return;
  try {
    const response = await fetch(`http://mnl911.atwebpages.com/get_user_profile.php?nuser_id=${nuser_id}`);
    const data = await response.json();
    if (data.success) {
      setOriginalData([
        { label: "First Name", value: data.firstName || "", key: "firstName" },
        { label: "Last Name", value: data.lastName || "", key: "lastName" },
        { label: "Email Address", value: data.email || "", key: "email" },
        { label: "Phone Number", value: data.phone || "", key: "phone" },
      ]);
      setEditableData([
        { label: "First Name", value: data.firstName || "", key: "firstName" },
        { label: "Last Name", value: data.lastName || "", key: "lastName" },
        { label: "Email Address", value: data.email || "", key: "email" },
        { label: "Phone Number", value: data.phone || "", key: "phone" },
      ]);
      // Set lockout state
      if (data.profile_lockout_until && Date.now() < data.profile_lockout_until) {
        setIsLockedOut(true);
        setLockoutUntil(data.profile_lockout_until);
        setIsEditing(false);
      } else {
        setIsLockedOut(false);
        setLockoutUntil(null);
      }
    }
  } catch (e) {
    // Optionally handle error
  }
};

const AccountDetails: React.FC = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = React.useState(false);
  const [originalData, setOriginalData] = React.useState<UserData[]>([
    { label: "First Name", value: "", key: "firstName" },
    { label: "Last Name", value: "", key: "lastName" },
    { label: "Email Address", value: "", key: "email" },
    { label: "Phone Number", value: "", key: "phone" },
  ]);
  const [editableData, setEditableData] = React.useState<UserData[]>([...originalData]);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  // Backend-driven lockout state
  const [isLockedOut, setIsLockedOut] = React.useState(false);
  const [lockoutMessage, setLockoutMessage] = React.useState('');
  const [lockoutUntil, setLockoutUntil] = React.useState<number | null>(null);
  const [lockoutCountdown, setLockoutCountdown] = React.useState("");

  React.useEffect(() => {
    fetchProfileFromBackend(setOriginalData, setEditableData, setIsLockedOut, setLockoutUntil, setIsEditing);
  }, []);

  React.useEffect(() => {
    if (!lockoutUntil) {
      setLockoutCountdown("");
      return;
    }
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = lockoutUntil - now;
      if (remaining <= 0) {
        setLockoutUntil(null);
        setIsLockedOut(false);
        setLockoutMessage('');
        setLockoutCountdown("");
        clearInterval(interval);
      } else {
        const min = Math.floor(remaining / 60000);
        const sec = Math.floor((remaining % 60000) / 1000);
        setLockoutCountdown(
          `You've tried to change your password too many times. You cannot update your profile for ${min > 0 ? min + " minute(s) " : ""}${sec} second(s)`
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleInputChange = (text: string, key: string) => {
    setEditableData(prevData =>
      prevData.map(field =>
        field.key === key ? { ...field, value: text } : field
      )
    );
  };

  const handleSave = async () => {
    // Phone number validation (PH: must be 11 digits, start with '09')
    const phoneField = editableData.find(f => f.key === 'phone');
    const phone = phoneField ? phoneField.value : '';
    if (!/^09\d{9}$/.test(phone)) {
      alert('Philippine mobile number must be exactly 11 digits and must start with 09 (e.g., 09062278962).');
      return; 
    }
    // Email validation
    const emailField = editableData.find(f => f.key === 'email');
    const email = emailField ? emailField.value : '';
    if (!isValidEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    setOriginalData([...editableData]);   
    let userData: { [key: string]: string } = {};
    for (const field of editableData) {
      await AsyncStorage.setItem(field.key, field.value);
      userData[field.key] = field.value;
    }
    const nuser_id = await AsyncStorage.getItem('nuser_id');
    let body = `nuser_id=${encodeURIComponent(nuser_id || "")}` +
      `&firstName=${encodeURIComponent(userData.firstName || "")}` +
      `&lastName=${encodeURIComponent(userData.lastName || "")}` +
      `&email=${encodeURIComponent(userData.email || "")}` +
      `&phone=${encodeURIComponent(userData.phone || "")}`;
    if (currentPassword || newPassword) {
      body += `&currentPassword=${encodeURIComponent(currentPassword)}`;
      body += `&newPassword=${encodeURIComponent(newPassword)}`;
    }
    try {
      const response = await fetch('http://mnl911.atwebpages.com/update_profile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      });
      const data = await response.json();
      if (data.success) {
        // Update AsyncStorage with new values
        await AsyncStorage.setItem('firstName', data.firstName || "");
        await AsyncStorage.setItem('lastName', data.lastName || "");
        await AsyncStorage.setItem('email', data.email || "");
        await AsyncStorage.setItem('phone', data.phone || "");

        // Refresh UI state from backend
        fetchProfileFromBackend(setOriginalData, setEditableData, setIsLockedOut, setLockoutUntil, setIsEditing);

        setCurrentPassword("");
        setNewPassword("");
        setIsEditing(false);

        // Show success alert
        alert(data.message || "Profile updated successfully");
      } else if (data.lockout) {
        setIsLockedOut(true);
        setLockoutMessage(data.message || "You've tried to change your password too many times. You cannot update your profile for");
        setLockoutUntil(data.lockout_until || null);
        setIsEditing(false);
        alert((data.message || "You've tried to change your password too many times. You cannot update your profile for") + (lockoutCountdown ? ' ' + lockoutCountdown : ''));
      } else {
        setIsLockedOut(false);
        setLockoutMessage('');
        setLockoutUntil(null);
        setIsEditing(true); // stay in edit mode for user to fix
        alert(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      alert("Network error. Please try again.");
      // Stay in edit mode
    }
  };

  const startEditing = () => {
    setEditableData([...originalData]);
    setIsEditing(true);
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleCancel = () => {
    setEditableData([...originalData]);
    setIsEditing(false);
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Details</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="height"
        keyboardVerticalOffset={0}
      >
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
              <TouchableOpacity style={styles.editAvatarButton} onPress={() => {}}>
                <Text style={styles.editAvatarText}>Change Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Lockout Message */}
          {isLockedOut && (
            <View style={{ marginBottom: 16, backgroundColor: '#fff3cd', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#ffeeba' }}>
              <Text style={{ color: '#856404', fontSize: 15, textAlign: 'center' }}>
                {lockoutCountdown ? lockoutCountdown : lockoutMessage}
              </Text>
            </View>
          )}

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
                  editable={isEditing && !isLockedOut}
                  placeholder={undefined}
                  placeholderTextColor="#666666"
                  keyboardType={field.key === 'phone' ? 'phone-pad' : 'default'}
                  maxLength={field.key === 'phone' ? 11 : undefined}
                />
              </View>
            ))}
            {/* Password display in view mode */}
            {!isEditing && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={"******"}
                  editable={false}
                  secureTextEntry
                  placeholderTextColor="#666666"
                />
              </View>
            )}
            {/* Password Change Fields (only in edit mode) */}
            {isEditing && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Current Password</Text>
                  <View style={styles.passwordInputWrapper}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      secureTextEntry={!showCurrentPassword}
                      placeholder="Enter current password"
                      placeholderTextColor="#666666"
                      editable={!isLockedOut}
                    />
                    <TouchableOpacity
                      onPress={() => setShowCurrentPassword(v => !v)}
                      style={styles.eyeIconAbsolute}
                    >
                      <MaterialIcons
                        name={showCurrentPassword ? 'visibility' : 'visibility-off'}
                        size={24}
                        color="#888"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>New Password</Text>
                  <View style={styles.passwordInputWrapper}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPassword}
                      placeholder="Enter a new password"
                      placeholderTextColor="#666666"
                      editable={!isLockedOut}
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword(v => !v)}
                      style={styles.eyeIconAbsolute}
                    >
                      <MaterialIcons
                        name={showNewPassword ? 'visibility' : 'visibility-off'}
                        size={24}
                        color="#888"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                  disabled={isLockedOut}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                  disabled={isLockedOut}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={startEditing}
                disabled={isLockedOut}
              >
                <Text style={styles.saveButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    marginLeft: 8,
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
    color: '#212121',
  },
  scrollView: {
    // other styles
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
    marginTop: 8,
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
  passwordInputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 44, // space for the eye icon
  },
  eyeIconAbsolute: {
    position: 'absolute',
    right: 8,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    zIndex: 2,
  },
});

export default AccountDetails;
