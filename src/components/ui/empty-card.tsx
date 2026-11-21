import { StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';

type EmptyCardProps = {
  title: string;
  description: string;
};

// Thẻ trống dùng chung: mục chưa có dữ liệu, bộ lọc không ra kết quả, hoặc danh sách rỗng.
export function EmptyCard({ title, description }: EmptyCardProps) {
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
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', paddingVertical: Spacing.xxl },
  title: { letterSpacing: -0.2 },
  description: { lineHeight: 19 },
});
