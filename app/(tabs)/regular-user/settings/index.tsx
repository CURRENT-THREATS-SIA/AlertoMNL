import { Link } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme, useTheme } from '../../../context/ThemeContext';

export default function Settings() {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Text style={[styles.title, { color: currentTheme.text }]}>Settings</Text>
      <View style={styles.menuContainer}>
        <Link href="/regular-user/settings/about" asChild>
          <TouchableOpacity style={[styles.menuItem, { backgroundColor: currentTheme.surface }]}>
            <Text style={[styles.menuText, { color: currentTheme.text }]}>About</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/regular-user/settings/privacy-policy" asChild>
          <TouchableOpacity style={[styles.menuItem, { backgroundColor: currentTheme.surface }]}>
            <Text style={[styles.menuText, { color: currentTheme.text }]}>Privacy Policy</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
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
  menuContainer: {
    gap: 16,
  },
  menuItem: {
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  menuText: {
    fontSize: 16,
  },
}); 