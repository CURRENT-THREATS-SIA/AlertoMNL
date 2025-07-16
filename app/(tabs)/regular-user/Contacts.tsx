import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { MoreVertical, Plus, RefreshCw, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const [editMode, setEditMode] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [editName, setEditName] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [editRelationship, setEditRelationship] = useState('');
  const [editLoading, setEditLoading] = useState(false);

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

  const handleEdit = () => {
    if (!selectedContact) return;
    setEditContact(selectedContact);
    setEditName(selectedContact.contact_name);
    setEditNumber(selectedContact.contact_number);
    setEditRelationship(selectedContact.relationship);
    setShowMenu(false);
    setEditMode(true);
  };

  const handleEditSave = async () => {
    if (!editContact) return;
    setEditLoading(true);
    try {
      const response = await fetch('http://mnl911.atwebpages.com/update_contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `contact_id=${editContact.contact_id}&contact_name=${encodeURIComponent(editName)}&contact_number=${encodeURIComponent(editNumber)}&relationship=${encodeURIComponent(editRelationship)}`,
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Contact updated!');
        setEditMode(false);
        setEditContact(null);
        fetchContacts();
      } else {
        Alert.alert(data.message || 'Failed to update contact');
      }
    } catch (error) {
      Alert.alert('Network error', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Header with Refresh */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>My Contacts</Text>
          <TouchableOpacity
            onPress={fetchContacts}
            disabled={loading}
            style={{ opacity: loading ? 0.5 : 1 }}
            accessibilityLabel="Refresh contacts"
          >
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
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          scrollEnabled={false}
        />

        {/* Add Contact Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
          <View style={styles.addButtonContent}>
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add New Contact</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Sheet Menu */}
      {showMenu && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setShowMenu(false)} />
          <View style={styles.actionModal}> 
            <Text style={styles.actionModalTitle}>{selectedContact?.contact_name}</Text>
            <TouchableOpacity onPress={handleEdit} style={styles.actionModalItem}>
              <Text style={[styles.actionModalText, { color: '#2196F3' }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.actionModalItem}>
              <Text style={[styles.actionModalText, { color: '#e02323' }]}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowMenu(false)} style={styles.actionModalItem}>
              <Text style={[styles.actionModalText, { color: '#888' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {editMode && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setEditMode(false)} />
          <View style={[styles.editModal, { backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.border }]}> 
            <View style={styles.editModalHeader}>
              <Text style={styles.menuTitle}>Edit Contact</Text>
              <TouchableOpacity onPress={() => setEditMode(false)} style={styles.closeButton}>
                <X size={22} color={currentTheme.subtitle} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, { color: currentTheme.text, borderColor: currentTheme.border }]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Name"
              placeholderTextColor={currentTheme.subtitle}
              editable={!editLoading}
            />
            <TextInput
              style={[styles.input, { color: currentTheme.text, borderColor: currentTheme.border }]}
              value={editNumber}
              onChangeText={setEditNumber}
              placeholder="Phone Number"
              placeholderTextColor={currentTheme.subtitle}
              keyboardType="phone-pad"
              editable={!editLoading}
            />
            <TextInput
              style={[styles.input, { color: currentTheme.text, borderColor: currentTheme.border }]}
              value={editRelationship}
              onChangeText={setEditRelationship}
              placeholder="Relationship"
              placeholderTextColor={currentTheme.subtitle}
              editable={!editLoading}
            />
            <TouchableOpacity onPress={handleEditSave} style={[styles.saveButton, editLoading && { opacity: 0.7 }]} disabled={editLoading}>
              <Text style={styles.saveButtonText}>{editLoading ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditMode(false)} style={styles.cancelButton}>
              <Text style={[styles.menuText, { color: '#e02323' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 16,
    paddingBottom: 24,
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
    width: '100%',
    marginTop: 16,
    marginBottom: 12,
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
    textAlignVertical: 'center',
    paddingTop: 0,
    paddingBottom: 0,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuContent: {
    minWidth: 260,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.semiBold,
    marginBottom: 16,
    color: '#e02323',
    textAlign: 'center',
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 8,
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
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    fontFamily: fonts.poppins.regular,
    marginBottom: 16,
    backgroundColor: '#f7f7f9',
  },
  editModal: {
    width: '90%',
    maxWidth: 340,
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    backgroundColor: '#fff',
  },
  editModalHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#e02323',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.poppins.semiBold,
  },
  cancelButton: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 2,
  },
  // Add new styles for the action modal
  actionModal: {
    width: '90%',
    maxWidth: 340,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#eee',
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  actionModalTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.semiBold,
    color: '#e02323',
    marginBottom: 18,
    textAlign: 'center',
  },
  actionModalItem: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 2,
  },
  actionModalText: {
    fontSize: 16,
    fontFamily: fonts.poppins.medium,
  },
});

export default Contacts;