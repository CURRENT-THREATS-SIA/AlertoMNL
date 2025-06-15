import React, { useEffect, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import * as SMS from 'expo-sms';
import {
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { fonts } from '../../../config/fonts';




// Define TypeScript interfaces
interface Permission {
  name: string;
  iconName: string;
  enabled: boolean;
  description: string;
}

// Initial permissions data with descriptions (police-specific)
const initialPermissions: Permission[] = [
  {
    name: 'Location',
    iconName: 'map-pin',
    enabled: false,
    description: 'Access your location to respond to nearby incidents and coordinate with other officers',
  },
  {
    name: 'Microphone',
    iconName: 'mic',
    enabled: false,
    description: 'Record voice messages and audio during emergency response situations',
  },
  {
    name: 'SMS',
    iconName: 'message-square',
    enabled: false,
    description: 'Send and receive emergency SMS alerts and updates from the command center',
  },
  {
    name: 'Storage',
    iconName: 'folder',
    enabled: false,
    description: 'Store incident reports, evidence files, and other important documents locally on your device',
  },
];

const AppPermissions: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);

  // Function to check and update permissions
  const checkPermissions = async () => {
    const checkedPermissions: Permission[] = [];
    // Location
    const { status: locationStatus } = await Location.getForegroundPermissionsAsync();
    checkedPermissions.push({ ...initialPermissions[0], enabled: locationStatus === 'granted' });
    // Microphone
    const { status: micStatus } = await Audio.getPermissionsAsync();
    checkedPermissions.push({ ...initialPermissions[1], enabled: micStatus === 'granted' });
    // SMS (can only check if available, not permission)
    const isSMSAvailable = await SMS.isAvailableAsync();
    checkedPermissions.push({ ...initialPermissions[2], enabled: isSMSAvailable });
    // Storage
    const { status: storageStatus } = await MediaLibrary.getPermissionsAsync();
    checkedPermissions.push({ ...initialPermissions[3], enabled: storageStatus === 'granted' });
    setPermissions(checkedPermissions);
  };

  // Re-check permissions when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      checkPermissions();
    }, [])
  );

  useEffect(() => {
    checkPermissions();
  }, []);

  const togglePermission = async (index: number) => {
    const perm = permissions[index];
    const newPermissions = [...permissions];
    
    if (Platform.OS === 'web' || Platform.OS === 'windows' || Platform.OS === 'macos') {
      alert('Permission requests are only supported on android mobile devices.');
      return;
    }
    if (!perm.enabled) {
      // User is turning ON, request permission
      let granted = false;
      if (perm.name === 'Location') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        granted = status === 'granted';
      } else if (perm.name === 'Microphone') {
        const { status } = await Audio.requestPermissionsAsync();
        granted = status === 'granted';
      } else if (perm.name === 'Storage') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        granted = status === 'granted';
      } else if (perm.name === 'SMS') {
        // No permission dialog, just check if available
        granted = await SMS.isAvailableAsync();
        if (!granted) {
          alert('SMS is not available on this device.');
        }
      }
      newPermissions[index].enabled = granted;
      setPermissions(newPermissions);
      if (!granted) {
        alert('Permission not granted.');
      }
    } else {
      // User is turning OFF, open app settings
      Alert.alert(
        'Change Permission',
        `To turn off ${perm.name} permission, please go to your device settings.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Profile Settings</Text>
        </View>
      </View>
      {/* Description */}
      <View style={styles.descriptionContainer}>
        <Feather name="shield" size={24} color="#666" />
        <Text style={styles.descriptionText}>
          These permissions are required for ALERTO MNL to function properly and enable effective emergency response operations.
        </Text>
      </View>
      {/* Permissions List */}
      <ScrollView contentContainerStyle={styles.permissionsList} showsVerticalScrollIndicator={false}>
        {permissions.map((permission, index) => (
          <View key={index} style={styles.permissionCard}>
            <View style={styles.permissionHeader}>
              <View style={styles.permissionInfo}>
                <View style={[styles.iconContainer, !permission.enabled && styles.iconContainerDisabled]}>
                  <Feather 
                    name={permission.iconName} 
                    size={24} 
                    color={permission.enabled ? "#e02323" : "#999"} 
                  />
                </View>
                <Text style={[styles.permissionName, !permission.enabled && styles.textDisabled]}>
                  {permission.name}
                </Text>
              </View>
              <Switch
                value={permission.enabled}
                onValueChange={() => togglePermission(index)}
                trackColor={{ false: '#dddddd', true: '#ffd1d1' }}
                thumbColor={permission.enabled ? '#e02323' : '#999999'}
                ios_backgroundColor="#dddddd"
                style={styles.switch}
              />
            </View>
            <Text style={[styles.permissionDescription, !permission.enabled && styles.textDisabled]}>
              {permission.description}
            </Text>
          </View>
        ))}
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
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  descriptionText: {
    flex: 1,
    fontFamily: fonts.poppins.regular,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  permissionsList: {
    padding: 16,
    gap: 12,
  },
  permissionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerDisabled: {
    backgroundColor: '#f5f5f5',
  },
  permissionName: {
    fontFamily: fonts.poppins.semiBold,
    fontSize: 16,
    color: '#212121',
  },
  permissionDescription: {
    fontFamily: fonts.poppins.regular,
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  textDisabled: {
    color: '#999999',
  },
  switch: {
    transform: [{ scale: 0.9 }],
  },
});

export default AppPermissions;
  