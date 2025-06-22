import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface AdminAuthContextType {
  adminEmail: string | null;
  login: (email: string) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const router = useRouter();

  const login = (email: string) => {
    setAdminEmail(email);
    router.replace('/(tabs)/admin/dashboard');
  };

  const logout = () => {
    setAdminEmail(null);
    router.replace('/(tabs)/admin/adminLogin');
  };

  return (
    <AdminAuthContext.Provider value={{ adminEmail, login, logout }}>
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