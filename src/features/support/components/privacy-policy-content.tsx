import { StyleSheet, Text, View } from 'react-native';

import {
  PRIVACY_POLICY_INTRO,
  PRIVACY_POLICY_SECTIONS,
  PRIVACY_POLICY_UPDATED_AT,
} from '@/features/support/constants/privacy-policy';
import { useTheme } from '@/hooks/use-theme';

/** Toàn văn chính sách quyền riêng tư, dùng chung cho màn riêng và hộp xem ở form đăng ký. */
export function PrivacyPolicyContent() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.updated, { color: theme.textSecondary }]}>
        Cập nhật lần cuối: {PRIVACY_POLICY_UPDATED_AT}
      </Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>{PRIVACY_POLICY_INTRO}</Text>

      {PRIVACY_POLICY_SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text accessibilityRole="header" style={[styles.heading, { color: theme.text }]}>
            {section.title}
          </Text>
          {section.paragraphs?.map((paragraph) => (
            <Text key={paragraph} style={[styles.paragraph, { color: theme.text }]}>
              {paragraph}
            </Text>
          ))}
          {section.bullets?.map((bullet) => (
            <View key={bullet.text} style={styles.bullet}>
              <Text style={[styles.dot, { color: theme.primary }]}>•</Text>
              <Text style={[styles.paragraph, styles.bulletText, { color: theme.text }]}>
                {bullet.label ? <Text style={styles.label}>{bullet.label}: </Text> : null}
                {bullet.text}
              </Text>
            </View>
          ))}
          {section.footer ? (
            <Text style={[styles.paragraph, { color: theme.text }]}>{section.footer}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  updated: { fontSize: 12, fontWeight: '700' },
  section: { gap: 8 },
  heading: { fontSize: 15, fontWeight: '900' },
  paragraph: { fontSize: 14, lineHeight: 21 },
  bullet: { flexDirection: 'row', gap: 8, paddingLeft: 4 },
  dot: { fontSize: 14, lineHeight: 21, fontWeight: '900' },
  bulletText: { flex: 1 },
  label: { fontWeight: '800' },
});
