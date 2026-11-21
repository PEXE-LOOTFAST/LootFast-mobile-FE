import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FontSize, FontWeight, Spacing } from '@/constants/theme';
import { Icon } from '@/components/ui/icon';
import { PrivacyPolicyContent } from '@/features/support/components/privacy-policy-content';
import { SupportIcons } from '@/features/support/constants/icons';
import { useTheme } from '@/hooks/use-theme';

type PrivacyPolicyModalProps = {
  visible: boolean;
  onClose: () => void;
};

/**
 * Form đăng ký nằm trong AuthModal phủ lên mọi màn, nên điều hướng sang /privacy-policy sẽ bị
 * che mất. Mở chính sách bằng một Modal riêng nằm trên AuthModal thay vì chuyển màn.
 */
export function PrivacyPolicyModal({ visible, onClose }: PrivacyPolicyModalProps) {
  const theme = useTheme();

  return (
    <Modal animationType="slide" onRequestClose={onClose} visible={visible}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
            Chính sách quyền riêng tư
          </Text>
          <Pressable
            accessibilityLabel="Đóng"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onClose}
          >
            <Icon name={SupportIcons.close} color={theme.text} size={22} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <PrivacyPolicyContent />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: { flex: 1, fontSize: FontSize.title, fontWeight: FontWeight.heavy, letterSpacing: -0.3 },
  content: { padding: Spacing.lg, paddingBottom: Spacing.huge },
});
