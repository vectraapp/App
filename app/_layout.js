import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ScreenCapture from 'expo-screen-capture';
import { ToastProvider } from '../components/shared/Toast';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import useAuthStore from '../store/authStore';

function RootLayoutContent() {
  const initialize = useAuthStore((s) => s.initialize);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    initialize();
    // Prevent screenshots and screen recording globally
    ScreenCapture.preventScreenCaptureAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <SafeAreaProvider>
        <ToastProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background.primary },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />
            <Stack.Screen name="course/[id]" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="question/[id]" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
            <Stack.Screen name="lecture/select-course" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="lecture/record" options={{ headerShown: false, presentation: 'card', gestureEnabled: false }} />
            <Stack.Screen name="lecture/[id]" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="ai/chat" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="settings/index" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="settings/appearance" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="settings/notifications" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="settings/downloads" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="legal/terms" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="legal/privacy" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="about/index" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="support/index" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="sharing/preview" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="sharing/redeem-code" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="sharing/shared-with-me" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="sharing/my-shares" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="groups/index" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="groups/create" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="groups/join" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="groups/[id]" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="upload/my-uploads" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="streaks" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="bookmarks" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="downloads" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="course/analysis" options={{ headerShown: false, presentation: 'card' }} />
          </Stack>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}
