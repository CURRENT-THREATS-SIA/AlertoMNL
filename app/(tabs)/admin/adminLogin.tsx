import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export const LoginScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('User123@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const onLogin = () => {
    // Add validation if needed
    if (email && password) {
      // Change the route path to match your file structure
      router.push('/(tabs)/admin/dashboard');
    }
  };

  const onForgotPassword = () => {
    // TODO: navigate to forgot password
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Left section: form */}
        <View style={styles.formContainer}>          <View style={styles.logoRow}>
            <Image
              source={require('../../../assets/images/ALERTOMNL-ICON.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.logoTitle}>ALERTO MNL</Text>
              <Text style={styles.logoSubtitle}>Response System</Text>
            </View>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Enter your official credentials to access</Text>
          </View>

          <View style={styles.fieldsContainer}>
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye size={24} /> : <EyeOff size={24} />}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footerRow}>
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <View style={styles.checkboxInner} />}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onForgotPassword}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>        {/* Right section: Welcome */}
        <View style={styles.welcomeSection}>
          <Image
            source={require('../../../assets/images/ALERTOMNL-ICON.png')}
            style={styles.welcomeLogo}
            resizeMode="contain"
          />
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeTitle}>Welcome to Admin Portal</Text>
            <Text style={styles.welcomeSubtitle}>Manage users, view crime data, and monitor emergency responses</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  innerContainer: {
    flex: 1,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 250,

  },
  formContainer: {
    flex: 1,
    maxWidth: 512,
    width: '100%',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 75,
    height: 76,
    marginRight: 8,
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E02323',
  },
  logoSubtitle: {
    fontSize: 14,
    fontWeight: '300',
    color: '#E02323',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    opacity: 0.75,
  },
  fieldsContainer: {
    width: '100%',
  },
  fieldWrapper: {
    marginBottom: 24,
  },
  label: {
    position: 'absolute',
    top: -10,
    left: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    fontSize: 12,
    color: '#1C1B1F',
    zIndex: 1,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#79747E',
    borderRadius: 4,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#79747E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#E02323',
    borderColor: '#E02323',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: '#FFFFFF',
  },
  rememberText: {
    fontSize: 14,
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF8682',
  },
  loginButton: {
    backgroundColor: '#E02323',
    height: 48,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 500,
    padding: 32,
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    gap: 24,
  },
  welcomeLogo: {
    width: 120,
    height: 120,
  },
  welcomeTextContainer: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#E02323',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
export default LoginScreen;