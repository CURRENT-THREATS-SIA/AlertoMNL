import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomTabBar from '../../../app/components/CustomTabBar';
import { fonts } from '../../config/fonts';

interface CrimeReport {
  location: string;
  reporter: string;
  dateTime: string;
  responder: string;
  distance: string;
  arrivalTime: string;
  description: string;
  crimeType: string;
  severity: string;
  voiceRecord: {
    title: string;
    duration: string;
    date: string;
  };
  victimInfo: {
    phone: string;
    email: string;
  };
}

const crimeReport: CrimeReport = {
  location: "Pandacan, Manila",
  reporter: "Juan Dela Cruz",
  dateTime: "3 May, 9:35 PM - 11:00 PM",
  responder: "PO1 Maria Santos",
  distance: "1.5 km",
  arrivalTime: "Arrived in 3 minutes",
  description: "None",
  crimeType: "Theft",
  severity: "Medium",
  voiceRecord: {
    title: "Voice record 1",
    duration: "1:10",
    date: "5/3/2025",
  },
  victimInfo: {
    phone: "0917883247",
    email: "example@gmail.com",
  },
};

export const HistoryContent: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Crime Report History</Text>

          {/* Location Card */}
          <View style={styles.card}>
            <View style={styles.locationHeader}>
              <View>
                <Text style={styles.location}>{crimeReport.location}</Text>
                <Text style={styles.reporter}>{crimeReport.reporter}</Text>
                <Text style={styles.dateTime}>{crimeReport.dateTime}</Text>
              </View>
              <View style={styles.responderInfo}>
                <Text style={styles.respondedBy}>Responded by</Text>
                <Text style={styles.responder}>{crimeReport.responder}</Text>
              </View>
            </View>

            <View 
              style={[styles.mapImage, {
                backgroundColor: '#E5E5E5',
                justifyContent: 'center',
                alignItems: 'center',
              }]}
            >
              <Text style={{ color: '#666' }}>Map Preview</Text>
            </View>

            <View style={styles.distanceInfo}>
              <Text style={styles.distanceText}>{crimeReport.distance}</Text>
              <Text style={styles.dot}>●</Text>
              <Text style={styles.arrivalTime}>{crimeReport.arrivalTime}</Text>
            </View>
          </View>

          {/* Details Card */}
          <View style={styles.card}>
            <View style={styles.detailsRow}>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.detailValue}>{crimeReport.description}</Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Crime Type</Text>
                <Text style={styles.detailValue}>{crimeReport.crimeType}</Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Severity</Text>
                <Text style={styles.detailValue}>{crimeReport.severity}</Text>
              </View>
            </View>

            {/* Voice Record Section */}
            <View style={styles.voiceRecordSection}>
              <Text style={styles.voiceRecordTitle}>{crimeReport.voiceRecord.title}</Text>
              <View style={styles.waveformContainer}>
                {[...Array(40)].map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.waveformBar,
                      {
                        height: Math.random() * 15 + 2,
                        opacity: 0.66
                      }
                    ]}
                  />
                ))}
                <TouchableOpacity style={styles.playButton}>
                  <MaterialIcons name="play-circle-filled" size={28} color="#E02323" />
                </TouchableOpacity>
              </View>
              <View style={styles.voiceRecordInfo}>
                <Text style={styles.voiceRecordDuration}>{crimeReport.voiceRecord.duration}</Text>
                <Text style={styles.voiceRecordDate}>{crimeReport.voiceRecord.date}</Text>
              </View>
            </View>

            {/* Victim Information */}
            <View style={styles.victimInfo}>
              <Text style={styles.victimInfoTitle}>Victim&apos;s Information</Text>
              <Text style={styles.victimInfoText}>{crimeReport.victimInfo.phone}</Text>
              <Text style={styles.victimInfoText}>{crimeReport.victimInfo.email}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <CustomTabBar activeScreen="History" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
  },
  content: {
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.poppins.semiBold,
    color: '#212121',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  location: {
    fontSize: 14,
    fontFamily: fonts.poppins.medium,
    color: '#E02323',
  },
  reporter: {
    fontSize: 11,
    fontFamily: fonts.poppins.medium,
    color: '#000',
  },
  dateTime: {
    fontSize: 10,
    fontFamily: fonts.poppins.medium,
    color: 'rgba(0, 0, 0, 0.24)',
  },
  responderInfo: {
    alignItems: 'flex-end',
    gap: 6,
  },
  respondedBy: {
    fontSize: 9,
    fontFamily: fonts.poppins.medium,
    color: '#19F315',
  },
  responder: {
    fontSize: 10,
    fontFamily: fonts.poppins.medium,
    color: 'rgba(0, 0, 0, 0.24)',
  },
  mapImage: {
    width: '100%',
    height: 110,
    borderRadius: 8,
  },
  distanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distanceText: {
    fontSize: 10,
    fontFamily: fonts.poppins.medium,
    color: 'rgba(0, 0, 0, 0.24)',
  },
  dot: {
    fontSize: 5,
    color: 'rgba(0, 0, 0, 0.24)',
  },
  arrivalTime: {
    fontSize: 10,
    fontFamily: fonts.poppins.medium,
    color: 'rgba(0, 0, 0, 0.24)',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 18,
  },
  detailColumn: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: fonts.poppins.semiBold,
    color: '#000',
  },
  detailValue: {
    fontSize: 10,
    fontFamily: fonts.poppins.regular,
    color: '#000',
  },
  voiceRecordSection: {
    gap: 6,
  },
  voiceRecordTitle: {
    fontSize: 14,
    fontFamily: fonts.poppins.semiBold,
    color: '#212121',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    gap: 1,
  },
  waveformBar: {
    flex: 1,
    backgroundColor: '#E02323',
    borderRadius: 1,
    marginTop: 6,
  },
  playButton: {
    marginLeft: 8,
    marginBottom: -4,
  },
  voiceRecordInfo: {
    flexDirection: 'row',
    gap: 20,
  },
  voiceRecordDuration: {
    fontSize: 11,
    fontFamily: fonts.poppins.regular,
    color: '#8B8B8B',
  },
  voiceRecordDate: {
    fontSize: 11,
    fontFamily: fonts.poppins.regular,
    color: '#8B8B8B',
  },
  victimInfo: {
    marginTop: 10,
  },
  victimInfoTitle: {
    fontSize: 14,
    fontFamily: fonts.poppins.semiBold,
    color: '#000',
  },
  victimInfoText: {
    fontSize: 11,
    fontFamily: 'Roboto',
    color: '#7E7E7E',
    lineHeight: 23,
  },
});

export default HistoryContent;
