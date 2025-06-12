import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme, useTheme } from '../../../context/ThemeContext';

export default function About() {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Text style={[styles.title, { color: currentTheme.text }]}>About ALERTO MNL</Text>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Our Mission</Text>
        <Text style={[styles.text, { color: currentTheme.text }]}>
          ALERTO MNL is dedicated to enhancing public safety in Manila through community-driven incident reporting and emergency response coordination.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Features</Text>
        <Text style={[styles.text, { color: currentTheme.text }]}>
          • Real-time incident reporting{'\n'}
          • Emergency contact management{'\n'}
          • Interactive crime mapping{'\n'}
          • Direct communication with law enforcement{'\n'}
          • Voice recording for emergency situations
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Version</Text>
        <Text style={[styles.text, { color: currentTheme.text }]}>1.0.0</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Contact</Text>
        <Text style={[styles.text, { color: currentTheme.text }]}>
          For support or inquiries:{'\n'}
          Email: support@alertomnl.com{'\n'}
          Phone: (02) 8123-4567
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
}); 