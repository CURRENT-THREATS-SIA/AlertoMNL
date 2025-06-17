import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { MoreVertical, Plus, RefreshCw } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PersonAlertIcon from '../../components/icons/PersonAlertIcon';
import { fonts } from '../../config/fonts';
import { theme, useTheme } from '../../context/ThemeContext';

interface Contact {
  contact_id: number;
  contact_name: string;
  contact_number: string;
  relationship: string;
}

const ContactCard: React.FC<{ contact: Contact; onMorePress: (contact: Contact) => void }> = ({ contact, onMorePress }) => {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  return (
    <View style={[styles.card, { backgroundColor: currentTheme.cardBackground }]}>
      <View style={styles.cardContent}>
        <View style={[styles.alertButtonContainer, { backgroundColor: isDarkMode ? '#2a2a2a' : '#FFF1F1' }]}>
          <PersonAlertIcon size={28} />
        </View>
        <View style={styles.contactInfo}>
          <Text style={[styles.contactName, { color: currentTheme.text }]}>{contact.contact_name}</Text>
          <Text style={[styles.contactPhone, { color: currentTheme.subtitle }]}>{contact.contact_number}</Text>
          <Text style={[styles.contactPhone, { color: currentTheme.subtitle }]}>{contact.relationship}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton} onPress={() => onMorePress(contact)}>
          <MoreVertical size={24} color={currentTheme.subtitle} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Contacts: React.FC = () => {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

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
  const handleMorePress = (contact: Contact) => {
    setSelectedContact(contact);
    setShowMenu(true);
  };

  const handleDelete = async () => {
    setShowMenu(false);
    if (!selectedContact) return;
    try {
      const response = await fetch('http://mnl911.atwebpages.com/delete_contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `contact_id=${selectedContact.contact_id}`,
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Contact deleted!');
        fetchContacts();
      } else {
        Alert.alert(data.message || 'Failed to delete contact');
      }
    } catch (error: Error | unknown) {
      Alert.alert('Network error', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header with Refresh */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>My Contacts</Text>
            <TouchableOpacity onPress={fetchContacts}>
              <RefreshCw size={24} color={currentTheme.subtitle} />
            </TouchableOpacity>
          </View>

          {/* Contact List */}
          <View style={styles.contactList}>
            {contacts.map((contact) => (
              <ContactCard key={contact.contact_id} contact={contact} onMorePress={handleMorePress} />
            ))}
          </View>

          {/* Add Contact Button */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add New Contact</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
       {/* Bottom Sheet Menu */}
       {showMenu && (
        <View style={[styles.menuContainer, { 
          backgroundColor: currentTheme.cardBackground,
          borderTopColor: currentTheme.border
        }]}>
          <TouchableOpacity onPress={handleDelete} style={styles.menuItem}>
            <Text style={[styles.menuText, { color: '#e33c3c' }]}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowMenu(false)} style={styles.menuItem}>
            <Text style={[styles.menuText, { color: currentTheme.subtitle }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 100,
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
    alignItems: 'center',
    gap: 16,
  },
  alertButtonContainer: {
    backgroundColor: '#FFF1F1',
    borderRadius: 8,
    padding: 8,
  },
  alertButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
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
  moreButton: {
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
    marginBottom: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    paddingTop: 4,
    fontSize: 14,
    fontFamily: fonts.poppins.bold,
  },
  menuContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    borderTopWidth: 1,
  },
  menuItem: {
    padding: 16,
  },
  menuText: {
    fontSize: 18,
  },
});

export default Contacts;