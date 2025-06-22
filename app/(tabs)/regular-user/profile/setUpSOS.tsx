import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { fonts } from '../../../config/fonts';
import { useTheme } from '../../../context/ThemeContext';

interface DelayOption {
  label: string;
  value: number; // seconds
}

const delayOptions: DelayOption[] = [
  { label: "3 Seconds", value: 3 },
  { label: "5 Seconds", value: 5 },
  { label: "10 Seconds", value: 10 },
  { label: "15 Seconds", value: 15 },
];

const SetUpSOS: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useTheme();
  const [hideSOS, setHideSOS] = useState(false);
  const [selectedDelay, setSelectedDelay] = useState<number>(3);

  useEffect(() => {
    AsyncStorage.getItem('hideSOSButton').then(val => {
      setHideSOS(val === '1');
    });
    AsyncStorage.getItem('sosDelay').then(val => {
      setSelectedDelay(val ? Number(val) : 3);
    });
  }, []);

  const handleHideSOSToggle = () => {
    setHideSOS(!hideSOS);
    AsyncStorage.setItem('hideSOSButton', !hideSOS ? '1' : '0');
  };

  const handleDelaySelect = (value: number) => {
    setSelectedDelay(value);
    AsyncStorage.setItem('sosDelay', value.toString());
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: theme.surface }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Setup SOS</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Toggle Options */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          {/* Hide SOS Toggle */}
          <TouchableOpacity
            style={styles.toggleItem}
            onPress={handleHideSOSToggle}
          >
            <View style={styles.toggleLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#fff5f5' }]}>
                <MaterialIcons name="visibility-off" size={24} color="#e02323" />
              </View>
              <Text style={[styles.toggleText, { color: theme.text }]}>Hide SOS text from button</Text>
            </View>
            <View style={[styles.toggle, hideSOS && styles.toggleActive]}>
              <View style={[styles.toggleHandle, hideSOS && styles.toggleHandleActive]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Delay Options */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Delay SOS</Text>
          <View style={styles.optionsContainer}>
            {delayOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  { 
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border
                  },
                  selectedDelay === option.value && styles.optionButtonActive,
                ]}
                onPress={() => handleDelaySelect(option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: theme.subtitle },
                    selectedDelay === option.value && styles.optionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
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
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    gap: 24,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  toggleLeft: {
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
  toggleText: {
    fontSize: 14,
    fontFamily: fonts.poppins.medium,
    color: '#212121',
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#e02323',
  },
  toggleHandle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    transform: [{ translateX: 0 }],
  },
  toggleHandleActive: {
    transform: [{ translateX: 20 }],
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.semiBold,
    color: '#212121',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  optionButtonActive: {
    backgroundColor: '#e02323',
    borderColor: '#e02323',
  },
  optionText: {
    fontSize: 14,
    fontFamily: fonts.poppins.regular,
  },
  optionTextActive: {
    color: 'white',
    fontFamily: fonts.poppins.semiBold,
  },
});

export default SetUpSOS;