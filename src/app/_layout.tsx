import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AuthModal } from '@/features/auth/components/auth-modal';
import { restoreSession } from '@/lib/auth-session';
import { queryClient } from '@/lib/query-client';

// Không gọi SplashScreen.preventAutoHideAsync() ở đây: lệnh hideAsync() tương ứng
// nằm trong component splash của template đã bị xoá, giữ lại sẽ kẹt màn splash vĩnh viễn.
export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    void restoreSession();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="seller" />
          <Stack.Screen name="admin" />
        </Stack>
        <AuthModal />
        <ConfirmDialog />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
