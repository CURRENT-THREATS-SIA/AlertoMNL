import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { fonts } from '../../../config/fonts';
import { theme, useTheme } from '../../../context/ThemeContext';

interface SettingItem {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  description: string;
  defaultValue?: boolean;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [pressedIndex, setPressedIndex] = React.useState<number | null>(null);

  const settingItems: SettingItem[] = [
    {
      icon: 'moon',
      label: 'Dark mode',
      description: 'Switch to dark theme for better viewing in low light',
      defaultValue: isDarkMode,
      onToggle: toggleDarkMode,
    },
    {
      icon: 'plus',
      label: 'Add Widget',
      description: 'Add quick access widgets to your home screen',
      defaultValue: false,
    },
    {
      icon: 'smartphone',
      label: 'Keep screen on',
      description: 'Prevent screen from turning off while using the app',
      defaultValue: true,
    },
    {
      icon: 'settings',
      label: 'Test Mode',
      description: 'Enable testing features for development',
      defaultValue: false,
    },
  ];

  const [switchStates, setSwitchStates] = React.useState(
    settingItems.map(item => item.defaultValue || false)
  );

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.surface }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color={currentTheme.headerText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.headerText }]}>Settings</Text>
      </View>

      {/* Settings Items */}
      <View style={[styles.settingsContainer, { backgroundColor: currentTheme.surface }]}>
        {settingItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.7}
            onPressIn={() => setPressedIndex(index)}
            onPressOut={() => setPressedIndex(null)}
            style={[
              styles.settingCard,
              pressedIndex === index && styles.settingCardPressed,
              { backgroundColor: currentTheme.surface }
            ]}
          >
            <View style={styles.settingContent}>
              <View style={styles.iconContainer}>
                <View style={[styles.iconBackground, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(224, 35, 35, 0.1)' }]}>
                  <Feather name={item.icon} size={20} color={isDarkMode ? '#fff' : '#E02323'} />
                </View>
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.settingLabel, { color: currentTheme.text }]}>{item.label}</Text>
                <Text style={[styles.settingDescription, { color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#666' }]}>
                  {item.description}
                </Text>
              </View>
              <Switch
                trackColor={{ false: isDarkMode ? '#404040' : '#D1D1D1', true: '#E02323' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={isDarkMode ? '#404040' : '#D1D1D1'}
                value={switchStates[index]}
                onValueChange={(newValue) => {
                  const newStates = [...switchStates];
                  newStates[index] = newValue;
                  setSwitchStates(newStates);
                  item.onToggle?.(newValue);
                }}
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
  },
  settingsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  settingCard: {
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
  settingCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  settingContent: {
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
  settingLabel: {
    fontSize: 16,
    fontFamily: fonts.poppins.semiBold,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    fontFamily: fonts.poppins.regular,
    lineHeight: 16,
  },
});
