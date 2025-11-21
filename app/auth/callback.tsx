import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/state/AuthContext';
import { theme } from '../../src/theme';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Wait for auth state to update after email confirmation
    if (!loading && !hasRedirected) {
      // Give Supabase a moment to process the URL and create the session
      const timer = setTimeout(() => {
        if (session) {
          // User is authenticated, redirect to app
          setHasRedirected(true);
          router.replace('/(tabs)');
        } else {
          // No session after timeout, redirect to login
          setHasRedirected(true);
          router.replace('/auth/login');
        }
      }, 1000); // Wait 1 second for Supabase to process

      return () => clearTimeout(timer);
    }
  }, [session, loading, router, hasRedirected]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Confirming your email...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.sage,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});

