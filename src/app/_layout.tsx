import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ToastHost } from '@/components/ui/toast-host';
import { AuthModal } from '@/features/auth/components/auth-modal';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { restoreSession } from '@/lib/auth-session';
import { resumeInterruptedPick } from '@/lib/pick-image';
import { queryClient } from '@/lib/query-client';
import { restoreThemePreference } from '@/lib/theme-preference';

// Không gọi SplashScreen.preventAutoHideAsync() ở đây: lệnh hideAsync() tương ứng
// nằm trong component splash của template đã bị xoá, giữ lại sẽ kẹt màn splash vĩnh viễn.
export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    void restoreThemePreference();
    void (async () => {
      await restoreSession();
      await resumeInterruptedPick();
    })();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {/* Theo theme của app chứ không theo máy: app mặc định sáng kể cả khi máy để tối, mà
            'auto' sẽ cho chữ trắng trên nền sáng. Màn nào có nền đậm phía trên thì dùng
            FocusedStatusBar để đè lên trong lúc đang hiện. */}
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="seller" />
          <Stack.Screen name="admin" />
        </Stack>
        <AuthModal />
        <ConfirmDialog />
        <ToastHost />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
