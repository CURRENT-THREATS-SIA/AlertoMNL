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
import { theme, useTheme } from '../../../context/ThemeContext';

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
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: currentTheme.surface }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={currentTheme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: currentTheme.text }]}>About</Text>
        </View>
      </View>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollViewContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../../assets/images/ALERTOMNL-ICON.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.appName, { color: '#E02323' }]}>ALERTO MNL</Text>
          <Text style={[styles.version, { color: currentTheme.subtitle }]}>Version 1.0.0</Text>
        </View>

        {/* Introduction Card */}
        <View style={[styles.card, { backgroundColor: currentTheme.cardBackground }]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="info" size={24} color="#E02323" />
            <Text style={[styles.cardTitle, { color: currentTheme.text }]}>Introduction</Text>
          </View>
          <Text style={[styles.introText, { color: currentTheme.text }]}>
            The <Text style={[styles.highlight, { color: '#E02323' }]}>ALERTO MNL</Text> app bridges Manila 
            citizens, tourists, and law enforcement for faster, safer outcomes. Users 
            can instantly alert nearby officers with precise location and incident 
            details. Officers receive clear, actionable requests and real-time updates, 
            minimizing response times and enhancing coordination.
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresContainer}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Key Features</Text>
          {keyFeatures.map((feature, index) => (
            <View key={index} style={[styles.featureCard, { backgroundColor: currentTheme.cardBackground }]}>
              <View style={[styles.featureIcon, { backgroundColor: '#fff5f5' }]}>
                <MaterialIcons name={feature.icon} size={24} color="#E02323" />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: currentTheme.text }]}>{feature.title}</Text>
                <Text style={[styles.featureDescription, { color: currentTheme.subtitle }]}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Mission Section */}
        <View style={[styles.card, styles.missionCard, { backgroundColor: currentTheme.cardBackground, borderColor: '#E0232320' }]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="flag" size={24} color="#E02323" />
            <Text style={[styles.cardTitle, { color: currentTheme.text }]}>Our Mission</Text>
          </View>
          <Text style={[styles.missionText, { color: currentTheme.text }]}>
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
    marginBottom: 4,
  },
  version: {
    fontSize: 12,
    fontFamily: fonts.poppins.regular,
  },
  card: {
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
  },
  introText: {
    fontSize: 14,
    lineHeight: 24,
    fontFamily: fonts.poppins.regular,
  },
  highlight: {
    fontFamily: fonts.poppins.semiBold,
  },
  featuresContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.semiBold,
    marginBottom: 4,
  },
  featureCard: {
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
  },
  featureDescription: {
    fontSize: 12,
    fontFamily: fonts.poppins.regular,
    lineHeight: 18,
  },
  missionCard: {
    borderWidth: 1,
  },
  missionText: {
    fontSize: 14,
    lineHeight: 24,
    fontFamily: fonts.poppins.regular,
    textAlign: 'center',
  },
});

export { About };
export default About;

