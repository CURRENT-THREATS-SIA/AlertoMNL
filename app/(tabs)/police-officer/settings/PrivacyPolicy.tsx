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

interface PolicySection {
  title: string;
  content: string[];
}

const policyData: PolicySection[] = [
  {
    title: "Introduction",
    content: [
      'Welcome to the SOS Response App ("we", "us", "our"). We provide a mobile application enabling users to send emergency alerts (SOS) to nearby police officers and view incident updates.',
    ],
  },
  {
    title: "Information We Collect",
    content: [
      "User-provided: Name, phone number, optional profile photo.",
      "Location data: Real-time GPS coordinates when sending or responding to SOS alerts.",
      "Incident details: Descriptions, photos, videos uploaded by users/officers.",
    ],
  },
  {
    title: "How We Use Data",
    content: [
      "Dispatch alerts to nearest available police officer.",
      "Display incident status and history to users and officers.",
      "Improve service reliability, safety zones, and analytics.",
    ],
  },
  {
    title: "Data Sharing",
    content: [
      "Shared only between the reporting user, assigned officers, and dispatch center.",
      "No third-party marketing or analytics.",
      "May disclose if required by law (court order, investigation).",
    ],
  },
  {
    title: "Data Retention & Security",
    content: [
      "All data stored securely on our servers for 2 years before anonymization.",
      "Encryption in transit (TLS) and at rest.",
      "Role-based access: users see only their incidents; officers see assigned cases.",
    ],
  },
  {
    title: "User Rights",
    content: [
      "Access: Request a copy of your data.",
      "Rectification: Edit or correct incident reports within 24 hours of submission.",
      "Deletion: Ask to remove your profile and related data (except anonymized logs).",
    ],
  },
  {
    title: "Contact Us",
    content: ["For questions or requests: support@sosapp.example"],
  },
];

export const PrivacyPolicy: React.FC = () => {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.contentContainer}>
          <Text style={styles.lastUpdated}>Last Updated: April 2025</Text>

          {policyData.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.content.map((item, itemIndex) => (
                <Text key={itemIndex} style={styles.sectionContent}>
                  • {item}
                </Text>
              ))}
              {index < policyData.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
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
    padding: 16,
  },
  lastUpdated: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: '#2d2828',
    marginBottom: 10,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: '#000000',
    marginBottom: 8,
  },
  sectionContent: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#000000',
    marginBottom: 4,
    paddingLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 12,
  },
});
