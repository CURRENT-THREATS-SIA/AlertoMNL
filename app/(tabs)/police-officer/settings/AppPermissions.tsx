import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
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

// Initial permissions data with descriptions
const initialPermissions: Permission[] = [
  {
    name: 'Location',
    iconName: 'map-pin',
    enabled: true,
    description: 'Access your location to respond to nearby incidents and coordinate with other officers',
  },
  {
    name: 'Microphone',
    iconName: 'mic',
    enabled: true,
    description: 'Record voice messages and audio during emergency response situations',
  },
  {
    name: 'SMS',
    iconName: 'message-square',
    enabled: true,
    description: 'Send and receive emergency SMS alerts and updates from the command center',
  },
  {
    name: 'Storage',
    iconName: 'folder',
    enabled: true,
    description: 'Store incident reports, evidence files, and other important documents locally on your device',
  },
];

export const Permissions: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
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
      <View style={styles.permissionsList}>
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
  