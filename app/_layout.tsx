import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { theme } from '@/theme';
import { colors } from '@/theme/tokens';
import { AuthProvider } from '@/features/auth/AuthProvider';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="post"
                options={{ presentation: 'modal', headerShown: false }}
              />
              <Stack.Screen name="item/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="chat/[conversationId]" options={{ headerShown: false }} />
              <Stack.Screen name="ngo/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="my-items" options={{ headerShown: false }} />
              <Stack.Screen name="demo-controls" options={{ headerShown: false }} />
              <Stack.Screen
                name="design-system"
                options={{ headerShown: true, title: 'Design System' }}
              />
              <Stack.Screen
                name="debug-services"
                options={{ headerShown: true, title: 'Services Verification' }}
              />
            </Stack>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
