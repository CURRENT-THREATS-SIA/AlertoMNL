import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Platform-aware storage
const isWeb = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

interface AdminAuthContextType {
  adminEmail: string | null;
  loading: boolean;
  login: (email: string) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Restore adminEmail from storage on mount
  useEffect(() => {
    const restoreEmail = async () => {
      if (isWeb) {
        const email = window.localStorage.getItem('adminEmail');
        if (email) setAdminEmail(email);
      } else {
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        const email = await AsyncStorage.getItem('adminEmail');
        if (email) setAdminEmail(email);
      }
      setLoading(false);
    };
    restoreEmail();
  }, []);

  const login = async (email: string) => {
    setAdminEmail(email);
    if (isWeb) {
      window.localStorage.setItem('adminEmail', email);
    } else {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem('adminEmail', email);
    }
    router.replace('/(tabs)/admin/dashboard');
  };

  const logout = async () => {
    setAdminEmail(null);
    if (isWeb) {
      window.localStorage.removeItem('adminEmail');
    } else {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.removeItem('adminEmail');
    }
    router.replace('/(tabs)/admin/adminLogin');
  };

  return (
    <AdminAuthContext.Provider value={{ adminEmail, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}; 