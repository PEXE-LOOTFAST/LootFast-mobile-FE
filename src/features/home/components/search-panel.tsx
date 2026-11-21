import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';
import { Icon } from '@/components/ui/icon';
import { CategoryChips } from '@/features/home/components/category-chips';
import { RadiusMenu } from '@/features/home/components/radius-menu';
import { HomeIcons } from '@/features/home/constants/icons';
import type { DealCategory, DealCategoryId } from '@/features/home/types';
import { useAnchor } from '@/hooks/use-anchor';
import { useTheme } from '@/hooks/use-theme';
import { formatRadius } from '@/lib/format';

type SearchPanelProps = {
  radiusKm: number;
  onChangeRadius: (km: number) => void;
  query: string;
  onChangeQuery: (query: string) => void;
  categories: DealCategory[];
  selectedCategoryId: DealCategoryId;
  onSelectCategory: (id: DealCategoryId) => void;
  /**
   * Chưa có GPS thì "gần bạn" chưa có nghĩa: chạm nút bán kính gọi `onPressRadiusLocked` (xin vị
   * trí) thay vì mở menu. Ô tìm kiếm và danh mục luôn dùng được, kể cả khi chưa đăng nhập.
   */
  isRadiusLocked?: boolean;
  onPressRadiusLocked?: () => void;
};

export function SearchPanel({
  radiusKm,
  onChangeRadius,
  query,
  onChangeQuery,
  categories,
  selectedCategoryId,
  onSelectCategory,
  isRadiusLocked = false,
  onPressRadiusLocked,
}: SearchPanelProps) {
  const theme = useTheme();
  const {
    ref: radiusRef,
    anchor: radiusAnchor,
    open: openRadius,
    close: closeRadius,
  } = useAnchor();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}
    >
      <View style={styles.row}>
        <Pressable
          ref={radiusRef}
          accessibilityLabel={
            isRadiusLocked
              ? 'Bật vị trí để tìm deal gần bạn'
              : `Bán kính tìm kiếm ${formatRadius(radiusKm)}`
          }
          accessibilityRole="button"
          onPress={isRadiusLocked ? onPressRadiusLocked : openRadius}
          style={[
            styles.radius,
            { backgroundColor: theme.primarySoft, borderColor: theme.backgroundSelected },
          ]}
        >
          <Icon name={HomeIcons.location} color={theme.primary} size={15} />
          <Text style={[styles.radiusLabel, { color: theme.text }]}>Gần bạn</Text>
          <Text style={[styles.radiusValue, { color: theme.textSecondary }]}>
            · {formatRadius(radiusKm)}
          </Text>
          <Icon name={HomeIcons.chevronDown} color={theme.textSecondary} size={15} />
        </Pressable>

        <View
          style={[styles.search, { backgroundColor: theme.background, borderColor: theme.border }]}
        >
          <Icon name={HomeIcons.search} color={theme.textSecondary} size={16} />
          <View style={styles.inputWrapper}>
            <TextInput
              accessibilityLabel="Tìm món hoặc quán"
              autoCorrect={false}
              onChangeText={onChangeQuery}
              placeholder="Tìm món hoặc quán"
              placeholderTextColor={theme.textSecondary}
              returnKeyType="search"
              style={[styles.input, { color: theme.text }]}
              value={query}
            />
          </View>
          {query ? (
            <Pressable
              accessibilityLabel="Xoá từ khoá"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => onChangeQuery('')}
            >
              <Icon name={HomeIcons.clear} color={theme.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <CategoryChips
        categories={categories}
        onSelect={onSelectCategory}
        selectedId={selectedCategoryId}
      />

      <RadiusMenu
        anchor={radiusAnchor}
        onChange={onChangeRadius}
        onClose={closeRadius}
        valueKm={radiusKm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    borderWidth: 1,
    borderRadius: Radius.xxl,
    paddingVertical: 10,
    boxShadow: Shadow.overlay,
  },
  row: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: 10 },
  radius: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
  },
  radiusLabel: { fontSize: FontSize.bodySm, fontWeight: FontWeight.bold },
  radiusValue: { fontSize: FontSize.bodySm, fontWeight: FontWeight.medium },
  search: {
    flex: 1,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
  },
  inputWrapper: { flex: 1, minWidth: 0 },
  // Trình duyệt tự vẽ viền focus riêng, lệch khỏi khung bo tròn của ô tìm kiếm.
  input: { height: 36, fontSize: FontSize.bodySm, outlineWidth: 0 },
});
