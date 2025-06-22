import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import * as SMS from 'expo-sms';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Platform, SafeAreaView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '../../../config/fonts';
import { useTheme } from '../../../context/ThemeContext';


interface Permission {
  name: string;
  description: string;
  enabled: boolean;
  iconName: keyof typeof MaterialIcons.glyphMap;
}

// Initial permissions data with descriptions
const initialPermissions: Permission[] = [
  {
    name: 'Location',
    iconName: 'location-on',
    enabled: false,
    description: 'Access your location to show nearby incidents and send accurate emergency alerts',
  },
  {
    name: 'Microphone',
    iconName: 'mic',
    enabled: false,
    description: 'Record voice messages and audio during emergency situations',
  },
  {
    name: 'SMS',
    iconName: 'message',
    enabled: false,
    description: 'Send emergency SMS alerts to your emergency contacts',
  },
];

const AppPermission: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useTheme();
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.surface} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: theme.surface }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>App Permissions</Text>
        </View>
      </View>

      {/* Description */}
      <View style={[styles.descriptionContainer, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <MaterialIcons name="security" size={24} color={theme.subtitle} />
        <Text style={[styles.descriptionText, { color: theme.subtitle }]}>
          These permissions are required for ALERTO MNL to function properly and provide emergency assistance when needed.
        </Text>
      </View>

      <View style={styles.content}>
        <FlashList
          data={permissions}
          renderItem={({ item, index }) => (
          <View key={index} style={[styles.permissionCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.permissionHeader}>
              <View style={styles.permissionInfo}>
                <View style={[
                  styles.iconContainer,
                    !item.enabled && styles.iconContainerDisabled,
                    { backgroundColor: item.enabled ? '#fff5f5' : theme.background }
                ]}>
                  <MaterialIcons 
                      name={item.iconName} 
                    size={24} 
                      color={item.enabled ? "#e02323" : theme.subtitle} 
                  />
                </View>
                <Text style={[
                  styles.permissionName,
                    { color: item.enabled ? theme.text : theme.subtitle }
                ]}>
                    {item.name}
                </Text>
              </View>
              <Switch
                  value={item.enabled}
                onValueChange={() => togglePermission(index)}
                trackColor={{ false: theme.border, true: '#ffd1d1' }}
                  thumbColor={item.enabled ? '#e02323' : theme.subtitle}
                ios_backgroundColor={theme.border}
                style={styles.switch}
              />
            </View>
            <Text style={[
              styles.permissionDescription,
                { color: item.enabled ? theme.subtitle : theme.subtitle }
            ]}>
                {item.description}
            </Text>
          </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          estimatedItemSize={100}
        />
      </View>
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
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  permissionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerDisabled: {
    opacity: 0.5,
  },
  permissionName: {
    fontSize: 16,
    fontFamily: fonts.poppins.medium,
    flex: 1,
  },
  switch: {
    marginLeft: 12,
  },
  permissionDescription: {
    fontSize: 14,
    fontFamily: fonts.poppins.regular,
    lineHeight: 20,
  },
});

export default AppPermission;
  
  