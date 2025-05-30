import { Redirect } from 'expo-router';

export default function Index() {
  // By default, redirect to the login screen
  return <Redirect href="/auth/Login" />;
} 