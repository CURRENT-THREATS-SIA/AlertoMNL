import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const keyFeatures: string[] = [
  "Real-time GPS dispatching",
  "Two-way status updates",
  "Integrated voice recording",
  "Role-based secure data sharing",
];

export const About: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <View style={styles.contentContainer}>
          {/* Introduction */}
          <Text style={styles.introText}>
            The <Text style={styles.appName}>ALERTO MNL</Text> app bridges Manila 
            citizens, tourist, and law enforcement for faster, safer outcomes. Users 
            can instantly alert nearby officers with precise location and incident 
            details. Officers receive clear, actionable requests and real-time updates, 
            minimizing response times and enhancing coordination.
          </Text>

          {/* Key Features */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Key Features</Text>
            {keyFeatures.map((feature, index) => (
              <Text key={index} style={styles.featureItem}>
                • {feature}
              </Text>
            ))}
          </View>

          {/* Mission */}
          <View style={styles.missionSection}>
            <Text style={styles.sectionTitle}>Mission</Text>
            <Text style={styles.missionText}>
              Empower communities and police with technology to protect lives
              and restore peace, one alert at a time.
            </Text>
          </View>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    gap: 32,
  },
  introText: {
    fontSize: 14,
    lineHeight: 25,
    color: '#000000',
    fontFamily: 'Poppins-Regular',
  },
  appName: {
    color: '#e02323',
    fontFamily: 'Poppins-Bold',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0232370',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000000',
    fontFamily: 'Poppins-Bold',
  },
  featureItem: {
    fontSize: 14,
    lineHeight: 25,
    color: '#000000',
    fontFamily: 'Poppins-Regular',
    paddingLeft: 8,
  },
  missionSection: {
    gap: 4,
  },
  missionText: {
    fontSize: 14,
    lineHeight: 25,
    color: '#000000',
    fontFamily: 'Poppins-Regular',
  },
  homeIndicator: {
    height: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIndicatorBar: {
    width: 136,
    height: 7,
    backgroundColor: '#a4a4a4',
    borderRadius: 100,
  },
});
