import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lockoutMessage, setLockoutMessage] = useState("");
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [lockoutCountdown, setLockoutCountdown] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!lockoutUntil) {
      setLockoutCountdown("");
      return;
    }
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = lockoutUntil - now;
      if (remaining <= 0) {
        setLockoutUntil(null);
        setLockoutMessage("");
        setLockoutCountdown("");
        clearInterval(interval);
      } else {
        const min = Math.floor(remaining / 60000);
        const sec = Math.floor((remaining % 60000) / 1000);
        setLockoutCountdown(
          `Login has been locked for ${min > 0 ? min + " minute(s) " : ""}${sec} second(s)"`
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }
    try {
      console.log('Attempting login...');
      const response = await fetch('http://mnl911.atwebpages.com/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setLockoutMessage("");
        setLockoutUntil(null);
        setLockoutCountdown("");
        if (data.user_type === "police") {
          await AsyncStorage.setItem('police_id', data.police_id.toString());
          await AsyncStorage.setItem('firstName', data.first_name);
          await AsyncStorage.setItem('lastName', data.last_name);
          await AsyncStorage.setItem('email', data.email);
          await AsyncStorage.setItem('phone', data.phone);
          await AsyncStorage.setItem('badge', data.badge_number);
          await AsyncStorage.setItem('station', data.station_name);
          router.push("/(tabs)/police-officer/PoliceOfficerHome");
        } else if (data.user_type === "regular") {
          await AsyncStorage.setItem('nuser_id', data.nuser_id.toString());
          await AsyncStorage.setItem('firstName', data.first_name);
          await AsyncStorage.setItem('lastName', data.last_name);
          await AsyncStorage.setItem('email', data.email);
          await AsyncStorage.setItem('phone', data.phone);
          // Do NOT store password!
          router.push("/regular-user");
        }
      } else if (data.lockout) {
        setLockoutMessage(data.message || "Too many failed attempts. Please try again later.");
        setLockoutUntil(data.lockout_until || null);
      } else {
        setLockoutMessage("");
        setLockoutUntil(null);
        setLockoutCountdown("");
        alert(data.message || "Invalid credentials");
      }
    } catch (error) {
      setLockoutMessage("");
      setLockoutUntil(null);
      setLockoutCountdown("");
      console.log('Login error:', error);
      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          alert("Network error. Unable to connect to server. Please check your internet connection.");
        } else if (error.message.includes('Server error')) {
          alert("Server error. Server is not responding. Please try again later.");
        } else {
          alert(`Network error: ${error.message}. Please try again.`);
        }
      } else {
        alert("Network error. Please try again.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Please sign in to continue</Text>

      {/* Lockout Message */}
      {lockoutMessage || lockoutCountdown ? (
        <View style={styles.lockoutContainer}>
          <MaterialIcons name="block" size={24} color="#e02323" style={{ marginRight: 8 }} />
          <Text style={styles.lockoutText}>
            {lockoutCountdown ? lockoutCountdown : lockoutMessage}
          </Text>
        </View>
      ) : null}

      {/* Email Address */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#0000004D"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password */}
      <View style={{ marginBottom: 10 }}>
      <View style={{ position: 'relative' }}>
        <TextInput
          style={styles.input}
          placeholderTextColor="#0000004D"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(v => !v)}
          style={{
            position: 'absolute',
            right: 10,
            top: 0,
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 8,
            zIndex: 2,
          }}
        >
          <MaterialIcons
            name={showPassword ? 'visibility' : 'visibility-off'}
            size={24}
            color="#888"
          />
        </TouchableOpacity>
      </View>
      <View style={{ alignItems: 'flex-end', marginTop: 6 }}>
        <TouchableOpacity onPress={() => router.push("/auth/VerificationEmail")}>  
          <Text style={{ color: '#e02323', fontWeight: 'bold' }}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
    </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>{"Don't have an account?"}</Text>
        <TouchableOpacity onPress={() => router.push("/auth/SignUp")}>
          <Text style={styles.signupLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
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
    marginBottom: 40,
    color: '#0000007a',
  },
  lockoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffeaea',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ffb3b3',
    marginBottom: 16,
  },
  lockoutText: {
    color: '#e02323',
    fontSize: 15,
    flex: 1,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  inputContainer: {
    marginBottom: 20,
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
  button: {
    backgroundColor: '#e02323',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  signupText: {
    color: '#000',
  },
  signupLink: {
    color: '#e02323',
    fontWeight: 'bold',
  },
});