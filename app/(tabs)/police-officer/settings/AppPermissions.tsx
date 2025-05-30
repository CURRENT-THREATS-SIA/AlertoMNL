import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

// Define TypeScript interfaces
interface Permission {
  name: string;
  iconName: string;
  enabled: boolean;
}

// Initial permissions data
const initialPermissions: Permission[] = [
  {
    name: 'Location',
    iconName: 'map-pin',
    enabled: true,
  },
  {
    name: 'Microphone',
    iconName: 'mic',
    enabled: true,
  },
  {
    name: 'SMS',
    iconName: 'message-square',
    enabled: true,
  },
  {
    name: 'Storage',
    iconName: 'folder',
    enabled: true,
  },
];

export const Permissions: React.FC = () => {
  const navigation = useNavigation();
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
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Permissions</Text>
      </View>

      {/* Permissions List */}
      <View style={styles.permissionsList}>
        {permissions.map((permission, index) => (
          <View key={index} style={styles.permissionItem}>
            <View style={styles.permissionInfo}>
              <Feather name={permission.iconName} size={24} color="#000000" />
              <Text style={styles.permissionName}>{permission.name}</Text>
            </View>
            <Switch
              value={permission.enabled}
              onValueChange={() => togglePermission(index)}
              trackColor={{ false: '#767577', true: '#e02323' }}
              thumbColor={permission.enabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
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
    fontWeight: 'bold',
    color: '#212121',
    fontFamily: 'Poppins-Bold',
  },
  permissionsList: {
    backgroundColor: '#ffffff',
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 67, 72, 0.09)',
    height: 84,
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  permissionName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#111619',
  },
  homeIndicator: {
    height: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  homeIndicatorBar: {
    width: 136,
    height: 7,
    backgroundColor: '#a4a4a4',
    borderRadius: 100,
  },
});
  