import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Circle, Path, Svg } from 'react-native-svg';

// --- SVG Icon Components ---

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
  a_created: string;
  f_name: string;
  l_name: string;
  m_number: string;
}

export default function ArrivedStep() {
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
        <Text>Loading Details...</Text>
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
        <Text style={styles.mapText}>[Map with incident location]</Text>
      </View>
      
      <View style={styles.infoCard}>
        <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>You've Arrived!</Text>
            <Text style={styles.instructions}>
                <Text style={styles.highlightText}>Secure your safety</Text>
                <Text>, park at a clear angle, and scan for any hazards. Then immediately locate the victim, assess their condition, and </Text>
                <Text style={styles.highlightText}>render aid or protection.</Text>
            </Text>

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
            
            <TouchableOpacity style={styles.button} onPress={() => router.push(`/police-officer/incident-response/ReportStep?alert_id=${alert_id}`)}>
              <Text style={styles.buttonText}>Crime Resolved</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
                Your priority is the victim's safety—act swiftly and stay secure.
            </Text>
        </ScrollView>
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
    flex: 1, // This makes the map take up the remaining space
    backgroundColor: '#e5e5e5', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  mapText: { color: '#666' },
  infoCard: { 
    // The card's height is now flexible, determined by its content.
    // The map's 'flex: 1' ensures it gets priority for screen space.
    paddingHorizontal: 24, 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    elevation: 8, 
    paddingTop: 32,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#111' },
  instructions: { color: '#666', fontSize: 14, marginBottom: 24, lineHeight: 20 },
  highlightText: { color: '#E02323' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  infoTextContainer: {
      marginLeft: 16,
  },
  label: { color: '#111', fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  value: { color: '#666', fontSize: 14, },
  button: { marginTop: 16, backgroundColor: '#E02323', borderRadius: 12, paddingVertical: 18, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footerText: {
      marginTop: 16,
      paddingBottom: 24,
      textAlign: 'center',
      color: '#666',
      fontSize: 12,
  },
});