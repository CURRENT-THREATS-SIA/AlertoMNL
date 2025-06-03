import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { fonts } from '../../../config/fonts';

interface Permission {
  name: string;
  iconName: string;
  enabled: boolean;
  description: string;
}

// Initial permissions data with descriptions
const initialPermissions: Permission[] = [
  {
    name: 'Location',
    iconName: 'location-on',
    enabled: true,
    description: 'Access your location to show nearby incidents and send accurate emergency alerts',
  },
  {
    name: 'Microphone',
    iconName: 'mic',
    enabled: true,
    description: 'Record voice messages and audio during emergency situations',
  },
  {
    name: 'SMS',
    iconName: 'message',
    enabled: true,
    description: 'Send emergency SMS alerts to your emergency contacts',
  },
  {
    name: 'Storage',
    iconName: 'folder',
    enabled: true,
    description: 'Store emergency information and media files locally on your device',
  },
];

const AppPermission: React.FC = () => {
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);

  const togglePermission = (index: number) => {
    const newPermissions = [...permissions];
    newPermissions[index] = {
      ...newPermissions[index],
      enabled: !newPermissions[index].enabled,
    };
    setPermissions(newPermissions);
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
        <Text style={styles.headerTitle}>App Permissions</Text>
      </View>

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <MaterialIcons name="security" size={24} color="#666" />
        <Text style={styles.descriptionText}>
          These permissions are required for ALERTO MNL to function properly and provide emergency assistance when needed.
        </Text>
      </View>

      {/* Permissions List */}
      <View style={styles.permissionsList}>
        {permissions.map((permission, index) => (
          <View key={index} style={styles.permissionCard}>
            <View style={styles.permissionHeader}>
              <View style={styles.permissionInfo}>
                <View style={[styles.iconContainer, !permission.enabled && styles.iconContainerDisabled]}>
                  <MaterialIcons 
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
      </View>
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
    marginLeft: 52,
    lineHeight: 20,
  },
  textDisabled: {
    color: '#999999',
  },
  switch: {
    transform: [{ scale: 0.9 }],
  },
});

export default AppPermission;
  