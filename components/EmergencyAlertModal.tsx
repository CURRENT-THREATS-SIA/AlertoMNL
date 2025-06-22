import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fonts } from '../app/config/fonts';
import { useAlert } from '../app/context/AlertContext';

export const EmergencyAlertModal: React.FC = () => {
  // Get the state and hide function from our context
  const alertContext = useAlert();
  const { isAlertVisible, hideAlert, currentAlertId } = alertContext || {};
  // Get the router to handle navigation
  const router = useRouter();

  if (!alertContext) return null;

  const handleGoToNotifications = () => {
    if (hideAlert) hideAlert(); // First, close the modal
    // This path should now be correct:
    router.push('/(tabs)/police-officer/Notifications'); 
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={isAlertVisible || false} // The modal's visibility is controlled by our context
      onRequestClose={() => hideAlert?.()} // Allows closing with the Android back button
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Ionicons name="warning" size={48} color="#e02323" />
          <Text style={styles.modalTitle}>New Emergency Alert!</Text>
          <Text style={styles.modalText}>An urgent SOS has been triggered.</Text>
          
          <TouchableOpacity style={styles.goButton} onPress={handleGoToNotifications}>
            <Text style={styles.goButtonText}>Go to Alerts</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// These styles are self-contained and won't affect your other components
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark semi-transparent background
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '85%',
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: fonts.poppins.bold,
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 25,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: fonts.poppins.regular,
    color: '#555',
  },
  goButton: {
    backgroundColor: '#e02323',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 40,
    elevation: 2,
    alignSelf: 'stretch',
  },
  goButtonText: {
    color: 'white',
    fontFamily: fonts.poppins.bold,
    textAlign: 'center',
    fontSize: 18,
  },
});