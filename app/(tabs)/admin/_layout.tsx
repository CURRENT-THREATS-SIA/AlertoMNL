import { Stack, useRouter, useSegments } from 'expo-router';
import React from 'react';
import { AdminAuthProvider, useAdminAuth } from '../../context/AdminAuthContext';

const AdminLayoutContent = () => {
  const { adminEmail, loading } = useAdminAuth();
  const segments = useSegments();
  const router = useRouter();

  const inAdminGroup = segments[0] === '(tabs)' && segments[1] === 'admin';

  React.useEffect(() => {
    if (loading) return; // Wait for loading to finish
    const isProtectedRoute = inAdminGroup && segments[2] !== 'adminLogin' && segments[2] !== 'createAdmin';

    // If the user is not logged in and is trying to access a protected admin route,
    // redirect them to the admin login page.
    if (!adminEmail && isProtectedRoute) {
      router.replace('/(tabs)/admin/adminLogin');
    }
  }, [adminEmail, segments, loading]);

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default function AdminLayout() {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent />
    </AdminAuthProvider>
  );
} 