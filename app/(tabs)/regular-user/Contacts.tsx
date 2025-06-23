import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { MoreVertical, Plus, RefreshCw } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [loading, setLoading] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    const nuser_id = await AsyncStorage.getItem('nuser_id');
    if (!nuser_id) {
      Alert.alert('User not found. Please log in again.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`http://mnl911.atwebpages.com/get_contacts1.php?nuser_id=${nuser_id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setContacts(data.contacts);
      } else {
        Alert.alert('Error', data.message || "Failed to fetch contacts");
      }
    } catch (error) {
      console.log('Contacts fetch error:', error);
      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          Alert.alert('Network Error', 'Unable to connect to server. Please check your internet connection.');
        } else if (error.message.includes('HTTP error')) {
          Alert.alert('Server Error', 'Server is not responding. Please try again later.');
        } else {
          Alert.alert('Error', `Failed to fetch contacts: ${error.message}`);
        }
      } else {
        Alert.alert('Error', 'Failed to fetch contacts. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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

      <View style={styles.content}>
        {/* Header with Refresh */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>My Contacts</Text>
          <TouchableOpacity onPress={fetchContacts} disabled={loading}>
            {loading ? (
              <ActivityIndicator size={24} color={currentTheme.subtitle} />
            ) : (
              <RefreshCw size={24} color={currentTheme.subtitle} />
            )}
          </TouchableOpacity>
        </View>

        {/* Contact List */}
        <FlashList
          data={contacts}
          renderItem={({ item }) => (
            <ContactCard contact={item} onMorePress={handleMorePress} />
          )}
          keyExtractor={(item) => item.contact_id.toString()}
          estimatedItemSize={80}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: currentTheme.subtitle }]}>No contacts found</Text>
              <Text style={[styles.emptySubText, { color: currentTheme.subtitle }]}>Add your emergency contacts</Text>
            </View>
          }
        />

        {/* Add Contact Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
          <View style={styles.addButtonContent}>
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add New Contact</Text>
          </View>
        </TouchableOpacity>
      </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.semiBold,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fonts.poppins.semiBold,
  },
  contactList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fonts.poppins.medium,
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 14,
    fontFamily: fonts.poppins.regular,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e02323',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginBottom: 100,
    justifyContent: 'center',
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.poppins.semiBold,
    marginLeft: 8,
  },
  menuContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 16,
    fontFamily: fonts.poppins.medium,
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
});

export default Contacts;