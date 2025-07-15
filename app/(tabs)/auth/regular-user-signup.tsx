import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidName = (name: string) => /^[A-Za-z ]+$/.test(name);

const SECURITY_QUESTIONS = [
  "What city you were born in?",
  "What is your mother's maiden name?",
  "What is your father's middle name?",
  "What is the name of your primary school?",
  "What is the name of your first pet?",
  "Who was your childhood hero?",
  "What is your favorite past-time?",
  "Others",
];
const OTHERS_VALUE = "Others";

export default function SignUpRegular() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [customQuestion, setCustomQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  const handleSignUp = async () => {
    const finalSecurityQuestion = selectedQuestion === OTHERS_VALUE ? customQuestion : selectedQuestion;

    if (!firstName || !lastName || !email || !phone || !password || !securityAnswer || !finalSecurityQuestion) {
      alert("Please fill in all fields, including the security question and answer.");
      return;
    }
    if (email.length > 70) {
      alert("Email address must not exceed 70 characters.");
      return;
    }
    if (!isValidName(firstName) || !isValidName(lastName)) {
      alert('First name and Last name must only contain letters.');
      return;
    }
    if (!/^09\d{9}$/.test(phone)) {
      alert('Philippine mobile number must be exactly 11 digits and must start with 09 (e.g., 09062278962).');
      return; 
    }
    if (!isValidEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (password.length > 9) {
      alert('Password must not exceed 9 characters including special characters.');
      return;
    }

    const body = `f_name=${encodeURIComponent(firstName)}&l_name=${encodeURIComponent(lastName)}&m_number=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&security_question=${encodeURIComponent(finalSecurityQuestion)}&security_answer=${encodeURIComponent(securityAnswer)}`;

    try {
      const response = await fetch('http://mnl911.atwebpages.com/regular_signup.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body,
      });
      const data = await response.json();

      if (data.success) {
        if (data.nuser_id) {
          await AsyncStorage.setItem('nuser_id', data.nuser_id.toString());
          await AsyncStorage.setItem('firstName', data.first_name);
          await AsyncStorage.setItem('lastName', data.last_name);
        }
        alert("Signup successful! Please continue to set permissions.");
        router.push("/auth/Permissions");
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      console.log(error);
      alert("Network error. Please try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Let&rsquo;s sign you up.</Text>
          <Text style={styles.subtitle}>Please enter your information to create your account.</Text>

          <View style={{ marginBottom: 18 }}><Text style={styles.label}>First Name</Text><TextInput style={styles.input} placeholderTextColor="#0000004D" placeholder="Input first name" value={firstName} onChangeText={setFirstName} /></View>
          <View style={{ marginBottom: 18 }}><Text style={styles.label}>Last Name</Text><TextInput style={styles.input} placeholderTextColor="#0000004D" placeholder="Input last name" value={lastName} onChangeText={setLastName} /></View>
          <View style={{ marginBottom: 18 }}><Text style={styles.label}>Email Address</Text><TextInput style={styles.input} placeholderTextColor="#0000004D" placeholder="Input email address" value={email} onChangeText={setEmail} keyboardType="email-address" /></View>
          <View style={{ marginBottom: 18 }}><Text style={styles.label}>Phone Number</Text><TextInput style={styles.input} placeholderTextColor="#0000004D" placeholder="Input phone number" value={phone} onChangeText={text => setPhone(text.replace(/[^0-9]/g, '').slice(0, 11))} keyboardType="phone-pad" /></View>

          <View style={{ marginBottom: 20 }}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput style={styles.passwordInput} placeholderTextColor="#0000004D" placeholder="Create Password" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye" : "eye-off"} size={24} color="#888" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginBottom: 18 }}>
            <Text style={styles.label}>Security Question</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={selectedQuestion} onValueChange={(itemValue) => setSelectedQuestion(itemValue)} style={styles.picker}>
                {SECURITY_QUESTIONS.map((q, index) => (
                  <Picker.Item key={index} label={q} value={q} />
                ))}
              </Picker>
            </View>
          </View>

          {selectedQuestion === OTHERS_VALUE && (
            <View style={{ marginBottom: 18 }}>
              <Text style={styles.label}>Your Custom Question</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor="#0000004D"
                placeholder="Type your security question"
                value={customQuestion}
                onChangeText={setCustomQuestion}
              />
            </View>
          )}

          <View style={{ marginBottom: 20 }}>
            <Text style={styles.label}>Security Answer</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholderTextColor="#0000004D"
                placeholder="Your answer"
                value={securityAnswer}
                onChangeText={setSecurityAnswer}
                secureTextEntry={!showAnswer}
              />
              <TouchableOpacity onPress={() => setShowAnswer(!showAnswer)} style={styles.eyeIcon}>
                <Ionicons name={showAnswer ? "eye" : "eye-off"} size={24} color="#888" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign up</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
            <Text style={{ color: '#000' }}>Already a member? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/Login")}><Text style={styles.loginLink}>Log in</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 40, paddingBottom: 20, flexGrow: 1 },
  title: { fontWeight: "bold", marginBottom: 10, fontSize: 34, color: '#e02323' },
  subtitle: { fontSize: 16, marginBottom: 20, color: '#0000007a' },
  label: { position: 'absolute', top: -10, left: 14, backgroundColor: '#fff', paddingHorizontal: 4, fontSize: 13, color: '#888', fontWeight: 'bold', zIndex: 2 },
  input: { fontSize: 16, height: 42, borderWidth: 1, borderColor: "#15050266", borderRadius: 8, paddingHorizontal: 18, backgroundColor: "#fff" },
  button: { backgroundColor: '#e02323', padding: 10, borderRadius: 10, marginTop: 12, marginBottom: 8 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  loginLink: { color: '#e02323', fontWeight: 'bold', textAlign: 'center' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: "#15050266", borderRadius: 8, height: 42 },
  passwordInput: { flex: 1, paddingHorizontal: 18, fontSize: 16 },
  eyeIcon: { paddingHorizontal: 10 },
  pickerContainer: { height: 42, borderWidth: 1, borderColor: "#15050266", borderRadius: 8, justifyContent: 'center' },
  picker: { width: '100%' },
});
