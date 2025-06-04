import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { MoreVertical, Plus, RefreshCw } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PersonAlertIcon from '../../components/icons/PersonAlertIcon';
import { fonts } from '../../config/fonts';

interface Contact {
  contact_id: number;
  contact_name: string;
  contact_number: string;
  relationship: string;
}

const ContactCard: React.FC<{ contact: Contact }> = ({ contact }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.leftContent}>
          <View style={styles.iconContainer}>
            <PersonAlertIcon size={30} />
          </View>
          <View>
            <Text style={styles.contactName}>{contact.contact_name}</Text>
            <Text style={styles.contactPhone}>{contact.contact_number}</Text>
            <Text style={styles.contactPhone}>{contact.relationship}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <MoreVertical size={24} color="#7e7e7e" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);

  const fetchContacts = async () => {
    const nuser_id = await AsyncStorage.getItem('nuser_id');
    if (!nuser_id) {
      Alert.alert('User not found. Please log in again.');
      return;
    }
    fetch(`http://mnl911.atwebpages.com/get_contacts1.php?nuser_id=${nuser_id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setContacts(data.contacts);
        else Alert.alert(data.message || "Failed to fetch contacts");
      });
  };

  useEffect(() => {
    fetchContacts();
  }, []);

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
            <TouchableOpacity onPress={fetchContacts}>
              <RefreshCw size={24} color="#7d7d7d" />
            </TouchableOpacity>
          </View>

          {/* Contact List */}
          <View style={styles.contactList}>
            {contacts.map((contact) => (
              <ContactCard key={contact.contact_id} contact={contact} />
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
    padding: 16,
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
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
  },
  contactName: {
    fontSize: 14,
    fontFamily: fonts.poppins.semiBold,
    color: '#000712',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 12,
    fontFamily: fonts.poppins.medium,
    color: '#7e7e7e',
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
