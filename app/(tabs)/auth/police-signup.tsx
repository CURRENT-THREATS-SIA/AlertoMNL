import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidBadgeNumber = (badge: string) => /^[A-Za-z]{4}-\d{6}$/.test(badge);
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

const STATION_OPTIONS = ["Default", ...Array.from({ length: 14 }, (_, i) => `Station ${i + 1}`)];

export default function SignUpPolice() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [badgeNumber, setBadgeNumber] = useState("");
  const [email, setEmail] = useState("");
  const [station, setStation] = useState("Default");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [customQuestion, setCustomQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  const handleBadgeInput = (text: string) => {
    let cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    let letters = cleaned.slice(0, 4);
    let numbers = cleaned.slice(4, 10).replace(/[^0-9]/g, '');
    setBadgeNumber(letters + (numbers ? '-' + numbers : ''));
  };

  const handleSignUp = async () => {
    const finalSecurityQuestion = selectedQuestion === OTHERS_VALUE ? customQuestion : selectedQuestion;

    if (!firstName || !lastName || !badgeNumber || !email || !station || !phone || !password || !finalSecurityQuestion || !securityAnswer) {
      alert("Please fill in all fields.");
      return;
    }
    if (!isValidName(firstName) || !isValidName(lastName)) {
      alert('First name and Last name must only contain letters.');
      return;
    }
    if (email.length > 70) {
      alert("Email address must not exceed 70 characters.");
      return;
    }
    if (password.length > 9) {
      alert('Password must not exceed 9 characters including special characters.');
      return;
    }
    if (!isValidBadgeNumber(badgeNumber)) {
      alert("Badge number must be in format: 4 letters - 6 digits (e.g. ABCD-123456)");
      return;
    }
    if (station === "Default") {
      alert("Please select a valid station.");
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
    try {
      const response = await fetch('http://mnl911.atwebpages.com/police_signup.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `f_name=${encodeURIComponent(firstName)}&l_name=${encodeURIComponent(lastName)}&m_number=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&badge_number=${encodeURIComponent(badgeNumber)}&station_name=${encodeURIComponent(station)}&security_question=${encodeURIComponent(finalSecurityQuestion)}&security_answer=${encodeURIComponent(securityAnswer)}`
      });
      const data = await response.json();
      if (data.success) {
        if (data.police_id) {
          await AsyncStorage.setItem('police_id', data.police_id.toString());
        }
        alert("Signup successful! Please continue to set permissions.");
        router.push("/auth/Permissions");
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      console.log(error)
      alert("Network error. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView 
          contentContainerStyle={styles.container} 
          keyboardShouldPersistTaps="handled" 
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Let&rsquo;s sign you up.</Text>
          <Text style={styles.subtitle}>Please enter your information to create your account.</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput 
              style={styles.input} 
              placeholderTextColor="#0000004D" 
              placeholder="Input first name" 
              value={firstName} 
              onChangeText={setFirstName} 
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput 
              style={styles.input} 
              placeholderTextColor="#0000004D" 
              placeholder="Input last name" 
              value={lastName} 
              onChangeText={setLastName} 
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Police Badge Number</Text>
            <TextInput 
              style={styles.input} 
              placeholderTextColor="#0000004D" 
              placeholder="E.g. ABCD-123456" 
              value={badgeNumber} 
              onChangeText={handleBadgeInput} 
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput 
              style={styles.input} 
              placeholderTextColor="#0000004D" 
              placeholder="Input email address" 
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address" 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Station</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={station} onValueChange={(itemValue: string) => setStation(itemValue)} style={styles.picker}>
                {STATION_OPTIONS.map((s, idx) => <Picker.Item key={idx} label={s} value={s} />)}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput 
              style={styles.input} 
              placeholderTextColor="#0000004D" 
              placeholder="Input phone number" 
              value={phone} 
              onChangeText={text => setPhone(text.replace(/[^0-9]/g, '').slice(0, 11))} 
              keyboardType="phone-pad" 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput 
                style={styles.passwordInput} 
                placeholderTextColor="#0000004D" 
                placeholder="Create Password" 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry={!showPassword} 
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye" : "eye-off"} size={Math.min(24, width * 0.06)} color="#888" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Security Question</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={selectedQuestion} onValueChange={setSelectedQuestion} style={styles.picker}>
                {SECURITY_QUESTIONS.map((q, index) => (<Picker.Item key={index} label={q} value={q} />))}
              </Picker>
            </View>
          </View>

          {selectedQuestion === OTHERS_VALUE && (
            <View style={styles.inputGroup}>
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

          <View style={styles.inputGroup}>
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
                <Ionicons name={showAnswer ? "eye" : "eye-off"} size={Math.min(24, width * 0.06)} color="#888" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign up</Text>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already a member? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/Login")}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    padding: Math.min(20, width * 0.05),
    paddingTop: Math.min(40, height * 0.05),
    paddingBottom: Math.min(20, height * 0.025),
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 34,
    color: '#e02323',
  },
  subtitle: {
    fontSize: Math.min(16, width * 0.04),
    marginBottom: Math.min(20, height * 0.025),
    color: '#0000007a',
    lineHeight: Math.min(24, width * 0.06),
  },
  inputGroup: {
    marginBottom: Math.min(18, height * 0.022),
    position: 'relative',
  },
  label: {
    position: 'absolute',
    top: -10,
    left: 14,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    fontSize: Math.min(13, width * 0.032),
    color: '#888',
    fontWeight: 'bold',
    zIndex: 2,
    marginBottom: 4,
  },
  input: {
    padding: 0,
    fontSize: Math.min(16, width * 0.04),
    height: Math.min(42, height * 0.05),
    borderWidth: 1,
    borderColor: "#15050266",
    borderRadius: 8,
    paddingHorizontal: Math.min(18, width * 0.045),
    backgroundColor: "#fff",
  },
  pickerContainer: {
    height: Math.min(42, height * 0.05),
    borderWidth: 1,
    borderColor: "#15050266",
    borderRadius: 8,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  picker: {
    width: '100%',
  },
  button: {
    backgroundColor: '#e02323',
    padding: Math.min(10, height * 0.012),
    borderRadius: 10,
    marginTop: Math.min(12, height * 0.015),
    marginBottom: Math.min(8, height * 0.01),
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: Math.min(16, width * 0.04),
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Math.min(16, height * 0.02),
    alignItems: 'center',
  },
  loginText: {
    color: '#000',
    fontSize: Math.min(16, width * 0.04),
  },
  loginLink: {
    color: '#e02323',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: Math.min(16, width * 0.04),
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#15050266",
    borderRadius: 8,
    height: Math.min(42, height * 0.05),
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: Math.min(18, width * 0.045),
    fontSize: Math.min(16, width * 0.04),
  },
  eyeIcon: {
    paddingHorizontal: Math.min(10, width * 0.025),
  },
});
