import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load saved theme preference when app starts
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleDarkMode = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Define theme colors
export const theme = {
  light: {
    background: '#f4f4f4',
    surface: '#FFFFFF',
    text: '#111619',
    border: 'rgba(60, 67, 72, 0.09)',
    headerText: '#212121',
    cardBackground: '#FFFFFF',
    cardBorder: '#E5E5E5',
    iconBackground: 'rgba(224, 35, 35, 0.1)',
    iconColor: '#E02323',
    modalBackground: '#FFFFFF',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    switchTrack: '#D1D1D1',
    switchThumb: '#FFFFFF',
    switchActive: '#E02323',
    statusPending: '#FFA500',
    statusResolved: '#4CAF50',
    statusInProgress: '#2196F3',
    subtitle: '#666666',
    divider: '#E5E5E5',
  },
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    border: 'rgba(255, 255, 255, 0.1)',
    headerText: '#FFFFFF',
    cardBackground: '#1E1E1E',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    iconBackground: 'rgba(255, 255, 255, 0.1)',
    iconColor: '#FFFFFF',
    modalBackground: '#1E1E1E',
    modalOverlay: 'rgba(0, 0, 0, 0.7)',
    switchTrack: '#404040',
    switchThumb: '#FFFFFF',
    switchActive: '#E02323',
    statusPending: '#FFA500',
    statusResolved: '#4CAF50',
    statusInProgress: '#2196F3',
    subtitle: 'rgba(255, 255, 255, 0.6)',
    divider: 'rgba(255, 255, 255, 0.1)',
  },
};

export default ThemeProvider; 