import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

export default function VerificationQNA() {
  const router = useRouter();
  const { email, user_type } = useLocalSearchParams();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await fetch('http://mnl911.atwebpages.com/forgot_password.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `step=1&email=${encodeURIComponent(email)}`,
        });
        const data = await res.json();
        if (data.success && data.question) {
          setQuestion(data.question);
        } else {
          showAlert('Error', data.message || 'User not found');
          router.back();
        }
      } catch (err) {
        console.error(err);
        showAlert('Network error', 'Unable to fetch question');
        router.back();
      }
    };
    fetchQuestion();
  }, []);

  const verifyAnswer = async () => {
    if (!answer) return showAlert('Missing Answer', 'Please enter your answer');
    try {
      const res = await fetch('http://mnl911.atwebpages.com/forgot_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `step=2&email=${encodeURIComponent(email)}&answer=${encodeURIComponent(answer)}&user_type=${user_type}`,
      });
      const data = await res.json();
      if (data.success) {
        router.push({ pathname: '/auth/ResetPassword', params: { email, user_type } });
      } else {
        showAlert('Error', data.message || 'Incorrect answer');
      }
    } catch (err) {
      console.error(err);
      showAlert('Network error', 'Unable to verify answer');
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
          <Text style={styles.title}>Security Question</Text>
          <Text style={styles.subtitle}>Answer your question with your saved answer.</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Question</Text>
            <Text style={styles.questionText}>{question}</Text>

            <Text style={styles.label}>Your Answer</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your answer"
              placeholderTextColor="#999"
              value={answer}
              onChangeText={setAnswer}
            />

            <TouchableOpacity style={styles.button} onPress={verifyAnswer}>
              <Text style={styles.buttonText}>Verify</Text>
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
  questionText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 12,
    fontWeight: 'bold',
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
