import AsyncStorage from '@react-native-async-storage/async-storage';

import { Picker } from '@react-native-picker/picker';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function SignUpPolice() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [badgeNumber, setBadgeNumber] = useState("");
  const [email, setEmail] = useState("");
  const [station, setStation] = useState("Default");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    // Check if any field is empty
    if (!firstName || !lastName || !badgeNumber || !email || !station || !phone || !password) {
      alert("Please fill in all fields.");
      return;
    }
    if (phone.length !== 11) {
      alert("Phone number must be exactly 11 digits.");
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
        body: `f_name=${encodeURIComponent(firstName)}&l_name=${encodeURIComponent(lastName)}&m_number=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&badge_number=${encodeURIComponent(badgeNumber)}&station_name=${encodeURIComponent(station)}`
      });
      const data = await response.json();
      if (data.success) {
        // add
        if (data.police_id) {
          await AsyncStorage.setItem('police_id', data.police_id.toString());
        }
        // end
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
      {/* Police Badge Number */}
      <View style={{ marginBottom: 18 }}>
        <Text style={styles.label}>Police Badge Number</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#0000004D"
          placeholder="Input police badge number"
          value={badgeNumber}
          onChangeText={setBadgeNumber}
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
      {/* Station Dropdown */}
      <View style={{ marginBottom: 18 }}>
        <Text style={styles.label}>Station</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            style={[styles.picker, { color: station === "Default" ? "#888" : "#000" }]}
            selectedValue={station}
            onValueChange={(itemValue: string) => setStation(itemValue)}
            dropdownIconColor="#e02323"
          >
            <Picker.Item label="Default" value="Default" />
            <Picker.Item label="Station 1" value="Station 1" />
            <Picker.Item label="Station 2" value="Station 2" />
            <Picker.Item label="Station 3" value="Station 3" />
            <Picker.Item label="Station 4" value="Station 4" />
            <Picker.Item label="Station 5" value="Station 5" />
            <Picker.Item label="Station 6" value="Station 6" />
            <Picker.Item label="Station 7" value="Station 7" />
            <Picker.Item label="Station 8" value="Station 8" />
            <Picker.Item label="Station 9" value="Station 9" />
            <Picker.Item label="Station 10" value="Station 10" />
            <Picker.Item label="Station 11" value="Station 11" />
            <Picker.Item label="Station 12" value="Station 12" />
            <Picker.Item label="Station 13" value="Station 13" />
            <Picker.Item label="Station 14" value="Station 14" />
          </Picker>
        </View>
      </View>

      {/* Phone Number */}
      <View style={{ marginBottom: 18 }}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#0000004D"
          placeholder="Input phone number"
          value={phone}
          onChangeText={text => {
            const cleaned = text.replace(/[^0-9]/g, '').slice(0, 11);
            setPhone(cleaned);
          }}
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
    paddingTop: 50,
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
    marginBottom: 60,
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#15050266",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#000',
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