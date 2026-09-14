import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/ui/brand-button';
import { useTheme } from '@/hooks/use-theme';

export function LoginScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable
          accessibilityLabel="Quay lại"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={[styles.backText, { color: theme.text }]}>‹</Text>
        </Pressable>

        <View style={[styles.logo, { backgroundColor: theme.primary }]}>
          <Text style={styles.logoText}>LF</Text>
        </View>

        <Text style={[styles.title, { color: theme.text }]}>Chào mừng trở lại</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Đăng nhập để giữ món ngon và theo dõi những phần ăn bạn đã cứu.
        </Text>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Email</Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="ban@example.com"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
            />
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.passwordLabel}>
              <Text style={[styles.label, { color: theme.text }]}>Mật khẩu</Text>
              <Text style={[styles.forgot, { color: theme.primary }]}>Quên mật khẩu?</Text>
            </View>
            <TextInput
              placeholder="Nhập mật khẩu"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
            />
          </View>

          <BrandButton onPress={() => router.replace('/')}>Đăng nhập</BrandButton>
        </View>

        <View style={styles.orRow}>
          <View style={[styles.orLine, { backgroundColor: theme.border }]} />
          <Text style={[styles.orText, { color: theme.textSecondary }]}>hoặc tiếp tục với</Text>
          <View style={[styles.orLine, { backgroundColor: theme.border }]} />
        </View>

        <View style={styles.socialRow}>
          <Pressable
            style={[
              styles.socialButton,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.socialText, { color: theme.text }]}>G</Text>
          </Pressable>
          <Pressable
            style={[
              styles.socialButton,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.socialText, { color: theme.text }]}>f</Text>
          </Pressable>
        </View>

        <Text style={[styles.signup, { color: theme.textSecondary }]}>
          Chưa có tài khoản?{' '}
          <Text style={{ color: theme.primary, fontWeight: '800' }}>Đăng ký ngay</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 30 },
  backButton: { width: 44, height: 44, justifyContent: 'center', marginTop: 4 },
  backText: { fontSize: 38, fontWeight: '300' },
  logo: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    borderRadius: 21,
  },
  logoText: { color: '#FFFFFF', fontSize: 23, fontWeight: '900' },
  title: { marginTop: 26, fontSize: 30, fontWeight: '900', letterSpacing: -0.7 },
  subtitle: { marginTop: 10, fontSize: 14, lineHeight: 21 },
  form: { marginTop: 32, gap: 20 },
  fieldGroup: { gap: 9 },
  passwordLabel: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 13, fontWeight: '800' },
  forgot: { fontSize: 12, fontWeight: '700' },
  input: { height: 54, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, fontSize: 15 },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 28 },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 11 },
  socialRow: { flexDirection: 'row', gap: 12 },
  socialButton: {
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 15,
  },
  socialText: { fontSize: 20, fontWeight: '900' },
  signup: { marginTop: 28, textAlign: 'center', fontSize: 13 },
});
