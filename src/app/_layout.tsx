import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AuthModal } from '@/features/auth/components/auth-modal';
import { queryClient } from '@/lib/query-client';

// Không gọi SplashScreen.preventAutoHideAsync() ở đây: lệnh hideAsync() tương ứng
// nằm trong component splash của template đã bị xoá, giữ lại sẽ kẹt màn splash vĩnh viễn.
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="seller" />
        </Stack>
        <AuthModal />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
