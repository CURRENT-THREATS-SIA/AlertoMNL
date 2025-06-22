import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as KeepAwake from 'expo-keep-awake';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { fonts } from '../../../../config/fonts';
import { theme, useTheme } from '../../../../context/ThemeContext';



interface PreferenceItem {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  description?: string;
  defaultValue?: boolean;
  onToggle?: (value: boolean) => void;
}

export default function PreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [pressedIndex, setPressedIndex] = React.useState<number | null>(null);
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const preferenceItems: PreferenceItem[] = [
    {
      icon: 'moon',
      label: 'Dark mode',
      description: 'Switch to dark theme for better viewing in low light',
      defaultValue: isDarkMode,
      onToggle: toggleDarkMode,
    },
    {
      icon: 'smartphone',
      label: 'Keep screen on',
      description: 'Prevent screen from turning off while using the app',
      defaultValue: false,
      onToggle: async (value: boolean) => {
        if (value) {
          await KeepAwake.activateKeepAwakeAsync();
        } else {
          await KeepAwake.deactivateKeepAwake();
        }
      },
    },
    {
      icon: 'settings',
      label: 'Test Mode',
      description: 'Enable testing features for development',
      defaultValue: false,
    },
  ];

  const [switchStates, setSwitchStates] = React.useState(
    preferenceItems.map(item => item.defaultValue || false)
  );

  // Persist and load 'Keep screen on' toggle
  React.useEffect(() => {
    (async () => {
      const value = await AsyncStorage.getItem('keepScreenOn');
      if (value !== null) {
        const newStates = [...switchStates];
        newStates[1] = value === 'true';
        setSwitchStates(newStates);
        if (value === 'true') {
          await KeepAwake.activateKeepAwakeAsync();
        } else {
          await KeepAwake.deactivateKeepAwake();
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Header */}
      <View style={[styles.header, { 
        paddingTop: insets.top + 12,
        backgroundColor: currentTheme.cardBackground,
        borderBottomColor: currentTheme.border,
        borderBottomWidth: 1
      }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={currentTheme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Preferences</Text>
        </View>
      </View>

      {/* Preference Items */}
      <View style={[styles.preferencesContainer, { backgroundColor: currentTheme.background }]}>
        {preferenceItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.7}
            onPressIn={() => setPressedIndex(index)}
            onPressOut={() => setPressedIndex(null)}
            style={[
              styles.preferenceCard,
              pressedIndex === index && styles.preferenceCardPressed,
              { backgroundColor: currentTheme.cardBackground }
            ]}
          >
            <View style={styles.preferenceContent}>
              <View style={styles.iconContainer}>
                <View style={[styles.iconBackground, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(224, 35, 35, 0.1)' }]}>
                  <Feather name={item.icon} size={20} color={isDarkMode ? '#fff' : '#E02323'} />
                </View>
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.preferenceLabel, { color: currentTheme.text }]}>{item.label}</Text>
                <Text style={[styles.preferenceDescription, { color: currentTheme.subtitle }]}>
                  {item.description}
                </Text>
              </View>
              <Switch
                trackColor={{ false: currentTheme.switchTrack, true: '#E02323' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={currentTheme.switchTrack}
                value={switchStates[index]}
                onValueChange={async (newValue) => {
                  const newStates = [...switchStates];
                  newStates[index] = newValue;
                  setSwitchStates(newStates);
                  if (item.label === 'Keep screen on') {
                    await AsyncStorage.setItem('keepScreenOn', newValue ? 'true' : 'false');
                  }
                  item.onToggle?.(newValue);
                }}
                style={styles.switch}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    paddingBottom: 12,
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
  },
  preferencesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  preferenceCard: {
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 2,
  },
  preferenceCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  preferenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 16,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  preferenceLabel: {
    fontSize: 16,
    fontFamily: fonts.poppins.semiBold,
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 12,
    fontFamily: fonts.poppins.regular,
    lineHeight: 16,
  },
  switch: {
    transform: [{ scale: 0.9 }],
  },
}); 