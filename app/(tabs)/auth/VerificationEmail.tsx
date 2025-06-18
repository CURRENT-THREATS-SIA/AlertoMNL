import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

function showAlert(title: string, message?: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}${message ? `: ${message}` : ''}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const fetchSecurityQuestion = async () => {
    if (!email) {
      showAlert('Missing email', 'Please enter your email');
      return;
    }

    try {
      const res = await fetch('http://mnl911.atwebpages.com/forgot_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `step=1&email=${encodeURIComponent(email)}`,
      });

      const data = await res.json();
      if (data.success && data.question) {
        router.push({
          pathname: '/auth/VerificationQNA',
          params: { email: email, user_type: data.user_type },
        });
      } else {
        showAlert('Error', data.message || 'User not found');
      }
    } catch (err) {
      console.error(err);
      showAlert('Network error', 'Unable to connect. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerWrap}>
          <Text style={styles.title}>FORGOT PASSWORD?</Text>
          <Text style={styles.subtitle}>Please enter your registered email below.</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Enter your registered email</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.button} onPress={fetchSecurityQuestion}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  innerWrap: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#e02323',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    color: '#555',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#e02323',
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
