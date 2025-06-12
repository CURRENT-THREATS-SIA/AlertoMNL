import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { fonts } from '../../../config/fonts';

interface DelayOption {
  label: string;
  value: number; // seconds
}

interface IntervalOption {
  label: string;
  value: number; // minutes, 0 for one-time
}

const delayOptions: DelayOption[] = [
  { label: "3 Seconds", value: 3 },
  { label: "5 Seconds", value: 5 },
  { label: "10 Seconds", value: 10 },
  { label: "15 Seconds", value: 15 },
];

const intervalOptions: IntervalOption[] = [
  { label: "Send SOS one time", value: 0 },
  { label: "Send SOS every 1 minute", value: 1 },
  { label: "Send SOS every 5 minutes", value: 5 },
  { label: "Send SOS every 10 minutes", value: 10 },
  { label: "Send SOS every 15 minutes", value: 15 },
];

const SetUpSOS: React.FC = () => {
  const router = useRouter();
  const [hideSOS, setHideSOS] = useState(false);
  const [triggerOnLaunch, setTriggerOnLaunch] = useState(false);
  const [selectedDelay, setSelectedDelay] = useState<number>(3);
  const [selectedInterval, setSelectedInterval] = useState<number>(0);

  const handleDelaySelect = (value: number) => {
    setSelectedDelay(value);
  };

  const handleIntervalSelect = (value: number) => {
    setSelectedInterval(value);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Up SOS</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Toggle Options */}
        <View style={styles.section}>
          {/* Hide SOS Toggle */}
          <TouchableOpacity
            style={styles.toggleItem}
            onPress={() => setHideSOS(!hideSOS)}
          >
            <View style={styles.toggleLeft}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="visibility-off" size={24} color="#e02323" />
              </View>
              <Text style={styles.toggleText}>Hide SOS from button</Text>
            </View>
            <View style={[styles.toggle, hideSOS && styles.toggleActive]}>
              <View style={[styles.toggleHandle, hideSOS && styles.toggleHandleActive]} />
            </View>
          </TouchableOpacity>

          {/* Trigger on Launch Toggle */}
          <TouchableOpacity
            style={styles.toggleItem}
            onPress={() => setTriggerOnLaunch(!triggerOnLaunch)}
          >
            <View style={styles.toggleLeft}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="launch" size={24} color="#e02323" />
              </View>
              <Text style={styles.toggleText}>Trigger SOS on app launch</Text>
            </View>
            <View style={[styles.toggle, triggerOnLaunch && styles.toggleActive]}>
              <View style={[styles.toggleHandle, triggerOnLaunch && styles.toggleHandleActive]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Delay Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delay SOS</Text>
          <View style={styles.optionsContainer}>
            {delayOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedDelay === option.value && styles.optionButtonActive,
                ]}
                onPress={() => handleDelaySelect(option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedDelay === option.value && styles.optionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Interval Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SOS Interval</Text>
          <View style={styles.radioGroup}>
            {intervalOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.radioItem}
                onPress={() => handleIntervalSelect(option.value)}
              >
                <View style={styles.radioOuter}>
                  {selectedInterval === option.value && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.radioLabel}>{option.label}</Text>
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
    fontSize: 16,
    fontFamily: fonts.poppins.semiBold,
    color: '#212121',
  },
  toggle: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e5e5',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#e02323',
  },
  toggleHandle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  toggleHandleActive: {
    transform: [{ translateX: 24 }],
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.semiBold,
    color: '#212121',
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#ffffff',
  },
  optionButtonActive: {
    backgroundColor: '#fff5f5',
    borderColor: '#e02323',
  },
  optionText: {
    fontSize: 14,
    fontFamily: fonts.poppins.medium,
    color: '#666666',
  },
  optionTextActive: {
    color: '#e02323',
  },
  radioGroup: {
    gap: 16,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e02323',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e02323',
  },
  radioLabel: {
    fontSize: 14,
    fontFamily: fonts.poppins.regular,
    color: '#212121',
  },
});

export default SetUpSOS;