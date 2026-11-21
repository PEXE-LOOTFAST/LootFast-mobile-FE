import type { ReactElement, ReactNode } from 'react';
import {
  ActivityIndicator,
  FlatList,
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

  const refreshControl = useRefreshControl(refreshing, onRefresh);
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

type ScreenListProps<T> = {
  header?: ReactNode;
  footer?: ReactNode;
  /** Nội dung cuộn cùng danh sách, nằm trên các mục (bộ lọc, tab, tiêu đề mục). */
  listHeader?: ReactNode;
  /** Khoảng cách giữa các khối trong `listHeader`. */
  listHeaderGap?: SpacingToken;
  data: readonly T[];
  renderItem: (item: T) => ReactElement;
  keyExtractor: (item: T) => string;
  /** Khoảng cách giữa các mục, và giữa `listHeader` với mục đầu tiên. */
  gap?: SpacingToken;
  /** Hiện khi `data` rỗng — thường là `QueryListEmpty` để phủ cả lúc đang tải và lỗi. */
  empty?: ReactElement | null;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Gọi khi cuộn gần cuối, để tải trang tiếp theo. */
  onEndReached?: () => void;
  /** Đang tải trang tiếp theo: hiện vòng xoay dưới mục cuối. */
  loadingMore?: boolean;
};

/**
 * Bản `Screen` cho màn chủ yếu là một danh sách dài: cùng nền, header, lề và bề rộng tối đa,
 * nhưng dựng trên FlatList để chỉ vẽ các mục đang hiện và tải thêm khi cuộn tới cuối.
 */
export function ScreenList<T>({
  header,
  footer,
  listHeader,
  listHeaderGap = 'xl',
  data,
  renderItem,
  keyExtractor,
  gap = 'md',
  empty = null,
  refreshing = false,
  onRefresh,
  onEndReached,
  loadingMore = false,
}: ScreenListProps<T>) {
  const theme = useTheme();
  const refreshControl = useRefreshControl(refreshing, onRefresh);

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {header}

      <FlatList
        ItemSeparatorComponent={SEPARATORS[gap]}
        ListEmptyComponent={empty}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={theme.primary} style={styles.loadingMore} />
          ) : null
        }
        ListHeaderComponent={
          listHeader ? (
            <View style={{ gap: Spacing[listHeaderGap], paddingBottom: Spacing[gap] }}>
              {listHeader}
            </View>
          ) : null
        }
        contentContainerStyle={[styles.body, styles.padded, styles.scrollContent]}
        data={data}
        keyExtractor={keyExtractor}
        keyboardShouldPersistTaps="handled"
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={refreshControl}
        renderItem={({ item }) => renderItem(item)}
        showsVerticalScrollIndicator={false}
        style={styles.fill}
      />

      {footer}
    </View>
  );
}

// FlatList dựng lại separator mỗi khi kiểu component đổi, nên mỗi bậc khoảng cách giữ một
// component cố định thay vì tạo hàm mới trong lúc render.
const SEPARATORS = Object.fromEntries(
  (Object.keys(Spacing) as SpacingToken[]).map((token) => [
    token,
    function Separator() {
      return <View style={{ height: Spacing[token] }} />;
    },
  ]),
) as Record<SpacingToken, () => ReactElement>;

function useRefreshControl(refreshing: boolean, onRefresh?: () => void) {
  const theme = useTheme();
  if (!onRefresh) return undefined;

  return (
    <RefreshControl
      colors={[theme.primary]}
      onRefresh={onRefresh}
      refreshing={refreshing}
      tintColor={theme.primary}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xxxl },
  loadingMore: { paddingVertical: Spacing.lg },
  body: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingTop: Spacing.lg,
  },
  padded: { paddingHorizontal: ScreenGutter },
  fill: { flex: 1 },
});
