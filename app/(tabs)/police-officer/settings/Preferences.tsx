import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { fonts } from '../../../config/fonts';

interface PreferenceItem {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  defaultValue?: boolean;
}

const preferenceItems: PreferenceItem[] = [
  {
    icon: 'moon',
    label: 'Dark mode',
    defaultValue: false,
  },
  {
    icon: 'plus',
    label: 'Add Widget',
    defaultValue: false,
  },
  {
    icon: 'smartphone',
    label: 'Keep screen on',
    defaultValue: true,
  },
  {
    icon: 'settings',
    label: 'Test Mode',
    defaultValue: false,
  },
];

export default function Preferences() {
  const router = useRouter();
  const [switchStates, setSwitchStates] = React.useState(
    preferenceItems.map(item => item.defaultValue || false)
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferences</Text>
      </View>

      {/* Preference Items */}
      <View style={styles.preferencesContainer}>
        {preferenceItems.map((item, index) => (
          <View 
            key={index} 
            style={[
              styles.preferenceItem,
              index !== preferenceItems.length - 1 && styles.itemBorder
            ]}
          >
            <View style={styles.preferenceContent}>
              <View style={styles.iconLabelContainer}>
                <Feather name={item.icon} size={24} color="#111619" />
                <Text style={styles.preferenceLabel}>{item.label}</Text>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#E02323' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#767577"
                value={switchStates[index]}
                onValueChange={(newValue) => {
                  const newStates = [...switchStates];
                  newStates[index] = newValue;
                  setSwitchStates(newStates);
                }}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 67, 72, 0.09)',
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
    color: '#212121',
  },
  preferencesContainer: {
    backgroundColor: '#FFFFFF',
  },
  preferenceItem: {
    paddingHorizontal: 26,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 67, 72, 0.09)',
  },
  preferenceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 34,
  },
  iconLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  preferenceLabel: {
    fontSize: 15,
    fontFamily: fonts.poppins.semiBold,
    color: '#111619',
    letterSpacing: 0.15,
  },
});
