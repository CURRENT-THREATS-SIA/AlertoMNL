import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  Image,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { fonts } from '../../../config/fonts';
import { useTheme } from '../../../context/ThemeContext';



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
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>,
  setAvatarUri?: React.Dispatch<React.SetStateAction<string | null>>
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
      if (setAvatarUri) {
        const proxyUrl = getProxyPhotoUrl(data.photo_url);
        setAvatarUri(proxyUrl);
        await AsyncStorage.setItem('photo_url', proxyUrl);
        console.log('Avatar URL set to:', proxyUrl);
      }
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

// Helper to extract filename from a URL and build the proxy URL
function getProxyPhotoUrl(photo_url: string | null | undefined) {
  const safeUrl = typeof photo_url === 'string' ? photo_url : '';
  const filename = safeUrl.split('/').pop();
  return `http://mnl911.atwebpages.com/get_profile_photo.php?file=${filename}`;
}

const AccountDetails: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { theme, isDarkMode } = useTheme();
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
  const [avatarUri, setAvatarUri] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchProfileFromBackend(setOriginalData, setEditableData, setIsLockedOut, setLockoutUntil, setIsEditing, setAvatarUri);
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
        fetchProfileFromBackend(setOriginalData, setEditableData, setIsLockedOut, setLockoutUntil, setIsEditing, setAvatarUri);

        setCurrentPassword("");
        setNewPassword("");
        setIsEditing(false);

        // Show success alert
        alert(data.message || "Profile updated successfully");
      } else if (data.lockout) {
        setIsLockedOut(true);
        setLockoutMessage(data.message || "You've tried to change your password too many times. You cannot update your profile for");
        const until = data.profile_lockout_until || data.lockout_until || null;
        setLockoutUntil(until);
        setIsEditing(false);
        // Immediately set the countdown so the timer appears right away
        if (until) {
          const now = Date.now();
          const remaining = until - now;
          if (remaining > 0) {
            const min = Math.floor(remaining / 60000);
            const sec = Math.floor((remaining % 60000) / 1000);
            setLockoutCountdown(
              `You've tried to change your password too many times. You cannot update your profile for ${min > 0 ? min + " minute(s) " : ""}${sec} second(s)`
            );
          } else {
            setLockoutCountdown("");
          }
        } else {
          setLockoutCountdown("");
        }
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

  // Image picker and upload
  const pickAndUploadImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission required!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      const nuser_id = await AsyncStorage.getItem('nuser_id');
      if (!nuser_id) {
        alert('User ID not found. Please log in again.');
        return;
      }
      const formData = new FormData();
      formData.append('nuser_id', nuser_id.toString());
      formData.append('photo', {
        uri: uri as string,
        name: 'profile.jpg',
        type: 'image/jpeg',
      } as any);
      try {
        const response = await fetch('http://mnl911.atwebpages.com/upload_profile_photo1.php', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.success) {
          const proxyUrl = getProxyPhotoUrl(data.photo_url);
          setAvatarUri(proxyUrl);
          await AsyncStorage.setItem('photo_url', proxyUrl);
          console.log('Avatar URL set to:', proxyUrl);
        } else {
          alert(data.message || 'Upload failed');
        }
      } catch (e) {
        alert('Network error');
      }
    }
  };

  // Add logging before rendering
  console.log('Rendering avatarUri:', avatarUri);
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.surface} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: theme.surface }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Account Details</Text>
        </View>
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
            <TouchableOpacity 
              style={[styles.avatar, { backgroundColor: theme.cardBackground }]} 
              onPress={isEditing ? pickAndUploadImage : undefined}
              activeOpacity={0.8}
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: 85, height: 85, borderRadius: 45 }}
                  resizeMode="cover"
                  onError={() => setAvatarUri(null)}
                />
              ) : (
                <MaterialIcons name="person" size={40} color="#e02323" />
              )}
              {isEditing && (
                <View style={[styles.editAvatarOverlay, { borderColor: theme.background }]}>
                  <MaterialIcons name="edit" size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Lockout Message */}
          {isLockedOut && (
            <View style={[styles.lockoutMessage, { backgroundColor: '#fff3cd', borderColor: '#ffeeba' }]}>
              <Text style={{ color: '#856404', fontSize: 15, textAlign: 'center' }}>
                {lockoutCountdown ? lockoutCountdown : lockoutMessage}
              </Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {editableData.map((field) => (
              <View key={field.key} style={styles.inputContainer}>
                <Text style={[
                  styles.inputLabel, 
                  { 
                    color: theme.subtitle,
                    backgroundColor: theme.background,
                    opacity: 0.8
                  }
                ]}>{field.label}</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: 'transparent',
                      color: theme.text,
                      borderColor: theme.border
                    },
                    !isEditing && styles.inputDisabled
                  ]}
                  value={field.value}
                  onChangeText={(text) => handleInputChange(text, field.key)}
                  editable={isEditing && !isLockedOut}
                  placeholder={undefined}
                  placeholderTextColor={theme.subtitle}
                  keyboardType={field.key === 'phone' ? 'phone-pad' : 'default'}
                  maxLength={field.key === 'phone' ? 11 : undefined}
                />
              </View>
            ))}
            {/* Password display in view mode */}
            {!isEditing && (
              <View style={styles.inputContainer}>
                <Text style={[
                  styles.inputLabel, 
                  { 
                    color: theme.subtitle,
                    backgroundColor: theme.background,
                    opacity: 0.8
                  }
                ]}>Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: 'transparent',
                      color: theme.text,
                      borderColor: theme.border
                    },
                    styles.inputDisabled
                  ]}
                  value={"******"}
                  editable={false}
                  secureTextEntry
                  placeholderTextColor={theme.subtitle}
                />
              </View>
            )}
            {/* Password Change Fields (only in edit mode) */}
            {isEditing && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={[
                    styles.inputLabel, 
                    { 
                      color: theme.subtitle,
                      backgroundColor: theme.background,
                      opacity: 0.8
                    }
                  ]}>Current Password</Text>
                  <View style={styles.passwordInputWrapper}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        { 
                          backgroundColor: 'transparent',
                          color: theme.text,
                          borderColor: theme.border
                        }
                      ]}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      secureTextEntry={!showCurrentPassword}
                      placeholder="Enter current password"
                      placeholderTextColor={theme.subtitle}
                      editable={!isLockedOut}
                    />
                    <TouchableOpacity
                      onPress={() => setShowCurrentPassword(v => !v)}
                      style={styles.eyeIconAbsolute}
                    >
                      <MaterialIcons
                        name={showCurrentPassword ? 'visibility' : 'visibility-off'}
                        size={24}
                        color={theme.subtitle}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={[
                    styles.inputLabel, 
                    { 
                      color: theme.subtitle,
                      backgroundColor: theme.background,
                      opacity: 0.8
                    }
                  ]}>New Password</Text>
                  <View style={styles.passwordInputWrapper}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        { 
                          backgroundColor: 'transparent',
                          color: theme.text,
                          borderColor: theme.border
                        }
                      ]}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPassword}
                      placeholder="Enter a new password"
                      placeholderTextColor={theme.subtitle}
                      editable={!isLockedOut}
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword(v => !v)}
                      style={styles.eyeIconAbsolute}
                    >
                      <MaterialIcons
                        name={showNewPassword ? 'visibility' : 'visibility-off'}
                        size={24}
                        color={theme.subtitle}
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
                  style={[
                    styles.button,
                    styles.cancelButton,
                    { 
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.border
                    }
                  ]}
                  onPress={handleCancel}
                  disabled={isLockedOut}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
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
  },
 
  header: {
    flexDirection: 'row',
    paddingBottom: 12,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    gap: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.semiBold,
    color: '#212121',
  },
  scrollView: {
    // other styles
  },
  scrollViewContent: {
    padding: 12,
    
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  avatar: {
    width: 85,
    height: 85,
    borderRadius: 45,
    backgroundColor: '#ffd1d1',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  editAvatarOverlay: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: '#e02323',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  formContainer: {
    gap: 8,
  },
  inputContainer: {
    marginBottom: 8,
  },
  inputLabel: {
    position: 'absolute',
    top: -8,
    left: 12,
    paddingHorizontal: 8,
    fontSize: 12,
    fontFamily: fonts.poppins.regular,
    zIndex: 1,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: fonts.poppins.regular,
    letterSpacing: 0.3,
    paddingTop: 12

  },
  inputDisabled: {
    opacity: 0.6,
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
    minWidth: 0,
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
  lockoutMessage: {
    marginBottom: 16,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
  },
});

export default AccountDetails;