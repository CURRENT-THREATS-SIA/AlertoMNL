import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Circle, Path, Svg } from 'react-native-svg';

// --- SVG Icon Components for the new UI ---

const LocationIcon = () => (
    <Svg height="24" width="24" viewBox="0 0 24 24" fill="none">
        <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M12 10a3 3 0 100-6 3 3 0 000 6z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const ClockIcon = () => (
    <Svg height="24" width="24" viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke="#333" strokeWidth="2" />
        <Path d="M12 6v6l4 2" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const ReportedIcon = () => (
    <Svg height="24" width="24" viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke="#333" strokeWidth="2" />
        <Path d="M12 8v4" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        <Path d="M12 16h.01" stroke="#333" strokeWidth="2" strokeLinecap="round" />
    </Svg>
);

const VictimIcon = () => (
    <Svg height="24" width="24" viewBox="0 0 24 24" fill="none">
        <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="12" cy="7" r="4" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);


// --- Main Component ---
interface AlertDetails {
  a_address: string;
  a_created: string;
  f_name: string;
  l_name: string;
  m_number: string;
}

export default function MapStep() {
  const router = useRouter();
  const { alert_id } = useLocalSearchParams();

  const [alertDetails, setAlertDetails] = useState<AlertDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!alert_id) {
        setError("Alert ID is missing.");
        setIsLoading(false);
        return;
    };

    const fetchAlertDetails = async () => {
      try {
        const response = await fetch(`http://mnl911.atwebpages.com/get_alert_details.php?alert_id=${alert_id}`);
        const result = await response.json();

        if (result.success) {
          setAlertDetails(result.data);
        } else {
          setError(result.error || 'Failed to fetch alert details.');
        }
      } catch (e) {
        console.error(e);
        setError('An error occurred. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlertDetails();
  }, [alert_id]);

  const getFormattedTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E02323" />
        <Text>Loading Incident Details...</Text>
      </View>
    );
  }

  if (error || !alertDetails) {
    return (
        <View style={styles.centered}>
            <Text style={styles.errorText}>{error || "Could not load alert details."}</Text>
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>[Map with route to incident]</Text>
      </View>
      <View style={styles.infoCard}>
        
        <View style={styles.infoRow}>
            <LocationIcon />
            <View style={styles.infoTextContainer}>
                <Text style={styles.label}>Location</Text>
                <Text style={styles.value}>{alertDetails.a_address}</Text>
            </View>
        </View>

        <View style={styles.infoRow}>
            <ClockIcon />
            <View style={styles.infoTextContainer}>
                <Text style={styles.label}>Estimated Time Arrival</Text>
                <Text style={styles.value}>15 minutes</Text>
            </View>
        </View>

        <View style={styles.infoRow}>
            <ReportedIcon />
            <View style={styles.infoTextContainer}>
                <Text style={styles.label}>Reported</Text>
                <Text style={styles.value}>{getFormattedTime(alertDetails.a_created)}</Text>
            </View>
        </View>

        <View style={styles.infoRow}>
            <VictimIcon />
            <View style={styles.infoTextContainer}>
                <Text style={styles.label}>Victim's Information</Text>
                <Text style={styles.value}>
                    {`${alertDetails.f_name} ${alertDetails.l_name} (${alertDetails.m_number})`}
                </Text>
            </View>
        </View>
        
        <TouchableOpacity style={styles.button} onPress={() => router.push(`/police-officer/incident-response/ArrivedStep?alert_id=${alert_id}`)}>
          <Text style={styles.buttonText}>You've Arrived</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  errorText: { 
    color: '#E02323', 
    fontSize: 16, 
    textAlign: 'center' 
  },
  mapPlaceholder: { 
    flex: 1, 
    backgroundColor: '#e5e5e5', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  mapText: { 
    color: '#666' 
  },
  infoCard: { 
    padding: 24, 
    paddingTop: 32,
    backgroundColor: '#fff', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    elevation: 8 
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  infoTextContainer: {
      marginLeft: 16,
  },
  // Updated label and value styles to match the image
  label: { 
    color: '#111', 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 2 
  },
  value: { 
    color: '#666', 
    fontSize: 14, 
    fontWeight: 'normal' // Value is not bold
  },
  button: { 
    marginTop: 8,
    backgroundColor: '#E02323', 
    borderRadius: 12, 
    paddingVertical: 18, 
    alignItems: 'center' 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
});
