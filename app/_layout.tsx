import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../src/state/AuthContext";
import { PlantsProvider } from "../src/state/PlantsContext";

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';
    const isCallback = segments[1] === 'callback';

    // Don't redirect if we're on the callback screen - let it handle the redirect
    if (isCallback) {
      return;
    }

    if (!session && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/auth/login');
    } else if (session && inAuthGroup && !isCallback) {
      // Redirect to home if authenticated and in auth group (but not on callback)
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="plant" />
      <Stack.Screen name="room" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}

function AppWithProviders() {
  const { session } = useAuth();

  // Always wrap with PlantsProvider, but it will only load data when user is authenticated
  return (
    <PlantsProvider>
      <RootLayoutNav />
    </PlantsProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppWithProviders />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
