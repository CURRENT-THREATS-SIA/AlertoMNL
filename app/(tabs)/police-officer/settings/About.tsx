import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { fonts } from '../../../../app/config/fonts';

interface Feature {
  title: string;
  description: string;
  icon: string;
}

const keyFeatures: Feature[] = [
  {
    title: "Real-time GPS Dispatching",
    description: "Instantly connect with nearby officers using precise location tracking",
    icon: "location-on"
  },
  {
    title: "Two-way Status Updates",
    description: "Stay informed with live incident status and officer responses",
    icon: "sync"
  },
  {
    title: "Voice Recording",
    description: "Record and send voice messages during emergencies",
    icon: "mic"
  },
  {
    title: "Secure Data Sharing",
    description: "Role-based access ensures your information stays protected",
    icon: "security"
  },
];

const About: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>About</Text>
        </View>
      </View>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../../assets/images/ALERTOMNL-ICON.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>ALERTO MNL</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        {/* Introduction Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="info" size={24} color="#e02323" />
            <Text style={styles.cardTitle}>Introduction</Text>
          </View>
          <Text style={styles.introText}>
            The <Text style={styles.highlight}>ALERTO MNL</Text> app bridges Manila 
            citizens, tourists, and law enforcement for faster, safer outcomes. Users 
            can instantly alert nearby officers with precise location and incident 
            details. Officers receive clear, actionable requests and real-time updates, 
            minimizing response times and enhancing coordination.
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          {keyFeatures.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <MaterialIcons name={feature.icon} size={24} color="#e02323" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Mission Section */}
        <View style={[styles.card, styles.missionCard]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="flag" size={24} color="#e02323" />
            <Text style={styles.cardTitle}>Our Mission</Text>
          </View>
          <Text style={styles.missionText}>
            Empower communities and police with technology to protect lives
            and restore peace, one alert at a time.
          </Text>
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
  logoContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  appName: {
    fontSize: 24,
    fontFamily: fonts.poppins.bold,
    color: '#e02323',
    marginBottom: 4,
  },
  version: {
    fontSize: 12,
    fontFamily: fonts.poppins.regular,
    color: '#666',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.semiBold,
    color: '#212121',
  },
  introText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#424b5a',
    fontFamily: fonts.poppins.regular,
  },
  highlight: {
    color: '#e02323',
    fontFamily: fonts.poppins.semiBold,
  },
  featuresContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.semiBold,
    color: '#212121',
    marginBottom: 4,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
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
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontSize: 14,
    fontFamily: fonts.poppins.semiBold,
    color: '#212121',
  },
  featureDescription: {
    fontSize: 12,
    fontFamily: fonts.poppins.regular,
    color: '#666666',
    lineHeight: 18,
  },
  missionCard: {
    borderWidth: 1,
    borderColor: '#e0232320',
  },
  missionText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#424b5a',
    fontFamily: fonts.poppins.regular,
    textAlign: 'center',
  },
});

export { About };

