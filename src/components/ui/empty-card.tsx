import { StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { BrandButton } from '@/components/ui/brand-button';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';

type EmptyCardProps = {
  title: string;
  description: string;
  /** Việc nên làm tiếp (vd. "Đăng deal"), để thẻ trống không là ngõ cụt. */
  action?: { label: string; onPress: () => void };
};

// Thẻ trống dùng chung: mục chưa có dữ liệu, bộ lọc không ra kết quả, hoặc danh sách rỗng.
export function EmptyCard({ title, description, action }: EmptyCardProps) {
  return (
    <Card gap="xs" padding="xl" style={styles.card}>
      <AppText
        accessibilityRole="header"
        align="center"
        style={styles.title}
        variant="bodyLg"
        weight="heavy"
      >
        {title}
      </AppText>
      <AppText align="center" style={styles.description} tone="textSecondary" variant="bodySm">
        {description}
      </AppText>
      {action ? (
        <BrandButton onPress={action.onPress} style={styles.action}>
          {action.label}
        </BrandButton>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', paddingVertical: Spacing.xxl },
  title: { letterSpacing: -0.2 },
  description: { lineHeight: 19 },
  action: { alignSelf: 'stretch', marginTop: Spacing.md },
});
