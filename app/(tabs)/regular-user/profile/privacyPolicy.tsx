import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { fonts } from '../../../config/fonts';


interface PolicySection {
  title: string;
  content: string[];
  icon: string;
}

const policyData: PolicySection[] = [
  {
    title: "Introduction",
    icon: "info",
    content: [
      'Welcome to the SOS Response App ("we", "us", "our"). We provide a mobile application enabling users to send emergency alerts (SOS) to nearby police officers and view incident updates.',
    ],
  },
  {
    title: "Information We Collect",
    icon: "folder-shared",
    content: [
      "User-provided: Name, phone number, optional profile photo.",
      "Location data: Real-time GPS coordinates when sending or responding to SOS alerts.",
      "Incident details: Descriptions, photos, videos uploaded by users/officers.",
    ],
  },
  {
    title: "How We Use Data",
    icon: "data-usage",
    content: [
      "Dispatch alerts to nearest available police officer.",
      "Display incident status and history to users and officers.",
      "Improve service reliability, safety zones, and analytics.",
    ],
  },
  {
    title: "Data Sharing",
    icon: "share",
    content: [
      "Shared only between the reporting user, assigned officers, and dispatch center.",
      "No third-party marketing or analytics.",
      "May disclose if required by law (court order, investigation).",
    ],
  },
  {
    title: "Data Retention & Security",
    icon: "security",
    content: [
      "All data stored securely on our servers for 2 years before anonymization.",
      "Encryption in transit (TLS) and at rest.",
      "Role-based access: users see only their incidents; officers see assigned cases.",
    ],
  },
  {
    title: "User Rights",
    icon: "person",
    content: [
      "Access: Request a copy of your data.",
      "Rectification: Edit or correct incident reports within 24 hours of submission.",
      "Deletion: Ask to remove your profile and related data (except anonymized logs).",
    ],
  },
  {
    title: "Contact Us",
    icon: "mail",
    content: ["For questions or requests: support@sosapp.example"],
  },
];

const PrivacyPolicy: React.FC = () => {
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
          <Text style={styles.headerTitle}>Privacy Policy</Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.lastUpdatedContainer}>
            <MaterialIcons name="update" size={16} color="#666" />
            <Text style={styles.lastUpdated}>Last Updated: April 2025</Text>
          </View>

          {policyData.map((section, index) => (
            <View key={index} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name={section.icon} size={24} color="#e02323" />
                </View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <View style={styles.sectionContent}>
                {section.content.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.bulletPoint}>
                    <View style={styles.bullet} />
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
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
  },
  content: {
    flex: 1,
    gap: 24,
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  lastUpdated: {
    fontFamily: fonts.poppins.regular,
    fontSize: 12,
    color: '#666',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sectionHeader: {
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
  sectionTitle: {
    flex: 1,
    fontFamily: fonts.poppins.semiBold,
    fontSize: 16,
    color: '#212121',
  },
  sectionContent: {
    paddingLeft: 52,
    gap: 8,
  },
  bulletPoint: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e02323',
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    fontFamily: fonts.poppins.regular,
    fontSize: 14,
    color: '#424b5a',
    lineHeight: 22,
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 8,
  },
});

export default PrivacyPolicy;
