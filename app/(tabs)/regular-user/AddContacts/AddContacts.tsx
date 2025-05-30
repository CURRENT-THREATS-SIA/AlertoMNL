import React from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface FormField {
  id: string;
  label: string;
  placeholder: string;
}

export const AddContacts: React.FC = () => {
  const formFields: FormField[] = [
    { id: 'name', label: 'Name', placeholder: 'Enter full name of contact' },
    {
      id: 'phone',
      label: 'Phone Number',
      placeholder: 'Enter phone number of contact',
    },
    {
      id: 'email',
      label: 'Email Address',
      placeholder: 'Enter email address of contact',
    },
    {
      id: 'relationship',
      label: 'Relationship',
      placeholder: 'Enter relationship to you',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Form Section */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Add Number</Text>

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Image
              style={styles.avatar}
              source={require('../../../../assets/images/userIcon.png')}
            />
          </View>

          {/* Form Fields */}
          {formFields.map((field) => (
            <View key={field.id} style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                {field.label}
                <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor="#7e7e7e"
              />
            </View>
          ))}

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Contact</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f4f4f4',
  },
  scrollView: {
    flex: 1,
  },
  profileIcon: {
    width: 14,
    height: 14,
  },
  formContainer: {
    padding: 12,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#7d7d7d',
  },
  avatarContainer: {
    alignSelf: 'center',
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#f66e6e9c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 21,
    height: 21,
  },
  fieldContainer: {
    marginBottom: 0,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000712',
  },
  required: {
    color: '#e02323',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    fontSize: 12,
    color: '#7e7e7e',
    fontWeight: '500',
  },
  saveButton: {
    height: 17,
    backgroundColor: '#e33c3c',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
