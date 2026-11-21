import type { ReactNode } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { MaxContentWidth, ScreenGutter, Spacing, type SpacingToken } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = {
  /** Header cố định phía trên vùng cuộn (BuyerHeader, SellerHeader…). */
  header?: ReactNode;
  /** Dải cố định ở đáy, không cuộn theo nội dung (vd. thanh đặt món). */
  footer?: ReactNode;
  children: ReactNode;
  /** Khoảng cách giữa các khối nội dung. */
  gap?: SpacingToken;
  /** Bỏ lề trái/phải khi nội dung tự trải hết bề ngang (bản đồ, ảnh lớn). */
  padded?: boolean;
  /** `false` cho màn tự quản lý cuộn (FlatList, bản đồ). */
  scroll?: boolean;
  /** Màn có ô nhập: tự cuộn ô đang nhập lên khỏi bàn phím. */
  keyboardAware?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Khung chung của một màn: nền, header, vùng cuộn có kéo-để-làm-mới, nội dung giới hạn bề rộng
 * trên màn lớn, lề trái/phải và khoảng đệm đáy thống nhất giữa các màn.
 */
export function Screen({
  header,
  footer,
  children,
  gap = 'xl',
  padded = true,
  scroll = true,
  keyboardAware = false,
  refreshing = false,
  onRefresh,
  contentStyle,
}: ScreenProps) {
  const theme = useTheme();

  const body = (
    <View
      style={[
        styles.body,
        { gap: Spacing[gap] },
        padded && styles.padded,
        !scroll && styles.fill,
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  const refreshControl = onRefresh ? (
    <RefreshControl
      colors={[theme.primary]}
      onRefresh={onRefresh}
      refreshing={refreshing}
      tintColor={theme.primary}
    />
  ) : undefined;

  const ScrollContainer = keyboardAware ? KeyboardAwareScrollView : ScrollView;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {header}

      {scroll ? (
        <ScrollContainer
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
        >
          {body}
        </ScrollContainer>
      ) : (
        body
      )}

      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xxxl },
  body: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingTop: Spacing.lg,
  },
  padded: { paddingHorizontal: ScreenGutter },
  fill: { flex: 1 },
});
