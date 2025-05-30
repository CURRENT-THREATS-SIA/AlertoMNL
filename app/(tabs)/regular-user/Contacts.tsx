import { router } from 'expo-router';
import { MoreVertical, Plus, RefreshCw } from 'lucide-react-native';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PersonAlertIcon from '../../components/icons/PersonAlertIcon';
import { fonts } from '../../config/fonts';

interface Contact {
  id: number;
  name: string;
  phone: string;
}

const mockContacts: Contact[] = [
  { id: 1, name: "User 1", phone: "+91 9923563487" },
  { id: 2, name: "User 2", phone: "+91 9906993484" },
  { id: 3, name: "User 3", phone: "+91 9906993999" },
];

const ContactCard: React.FC<{ contact: Contact }> = ({ contact }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactPhone}>{contact.phone}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.alertButton}>
            <PersonAlertIcon size={24} />
          </TouchableOpacity>
          <TouchableOpacity>
            <MoreVertical size={24} color="#7e7e7e" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const Contacts: React.FC = () => {
  const handleAddContact = () => {
    router.push('/regular-user/AddContacts');
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header with Refresh */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Contacts</Text>
            <TouchableOpacity>
              <RefreshCw size={24} color="#7d7d7d" />
            </TouchableOpacity>
          </View>

          {/* Contact List */}
          <View style={styles.contactList}>
            {mockContacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </View>

          {/* Add Contact Button */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add New Contact</Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
  },
  content: {
    flex: 1,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fonts.poppins.semiBold,
    color: '#7d7d7d',
  },
  contactList: {
    gap: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 14,
    fontFamily: fonts.poppins.semiBold,
    color: '#000712',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 12,
    fontFamily: fonts.poppins.medium,
    color: '#7e7e7e',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e33c3c',
    borderRadius: 100,
    padding: 10,
    gap: 8,
    marginTop: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    paddingTop: 4,
    fontSize: 14,
    fontFamily: fonts.poppins.bold,
  },
});

export default Contacts;
