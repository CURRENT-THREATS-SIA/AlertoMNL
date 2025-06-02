import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignUpRegular() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    // Check if any field is empty
    if (!firstName || !lastName || !email || !phone || !password) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      const response = await fetch('http://mnl911.atwebpages.com/regular_signup.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `f_name=${encodeURIComponent(firstName)}&l_name=${encodeURIComponent(lastName)}&m_number=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      });
      const data = await response.json();
      if (data.success) {
        // add
        if (data.nuser_id) {
          await AsyncStorage.setItem('nuser_id', data.nuser_id.toString());
        }
        // end
        alert("Signup successful! Please log in.");
        router.push("/auth/Login");
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      console.log(error);
      alert("Network error. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Let&rsquo;s sign you up.</Text>
      <Text style={styles.subtitle}>Please enter your information to create your account.</Text>

      {/* First Name */}
      <View style={{ marginBottom: 18 }}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#0000004D"
          placeholder="Input first name"
          value={firstName}
          onChangeText={setFirstName}
        />
      </View>
      {/* Last Name */}
      <View style={{ marginBottom: 18 }}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#0000004D"
          placeholder="Input last name"
          value={lastName}
          onChangeText={setLastName}
        />
      </View>
      {/* Email Address */}
      <View style={{ marginBottom: 18 }}>
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

      {/* Phone Number */}
      <View style={{ marginBottom: 18 }}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#0000004D"
          placeholder="Input phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>
      {/* Password */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#0000004D"
          placeholder="Create Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
     <Text style={styles.buttonText}>Sign up</Text>
   </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
        <Text style={{ color: '#000' }}>Already a member? </Text>
        <TouchableOpacity onPress={() => router.push("/auth/Login")}>
          <Text style={styles.loginLink}>Log in</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 80,
    height: "100%",
    width: "100%",
    backgroundColor: '#fff',
  },
  title: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 34,
    color: '#e02323',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#0000007a',
  },
  label: {
    position: 'absolute',
    top: -10,
    left: 14,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    fontSize: 13,
    color: '#888',
    fontWeight: 'bold',
    zIndex: 2,
    marginBottom: 4,
  },
  input: {
    padding: 0,
    fontSize: 16,
    height: 42,
    borderWidth: 1,
    borderColor: "#15050266",
    borderRadius: 8,
    paddingHorizontal: 18,
    backgroundColor: "#fff",
  },
  picker: {
    padding: 0,
    fontSize: 16,
    height: 42,
    borderWidth: 1,
    borderColor: "#15050266",
    borderRadius: 8,
    paddingHorizontal: 18,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: '#e02323',
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginLink: {
    color: '#e02323',
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 