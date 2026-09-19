import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { CategoryChips } from '@/features/home/components/category-chips';
import { HomeIcon } from '@/features/home/components/home-icon';
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
  /** Khách chưa đăng nhập: chạm vào ô tìm kiếm / bán kính sẽ gọi onPressLocked thay vì mở. */
  isLocked?: boolean;
  onPressLocked?: () => void;
};

export function SearchPanel({
  radiusKm,
  onChangeRadius,
  query,
  onChangeQuery,
  categories,
  selectedCategoryId,
  onSelectCategory,
  isLocked = false,
  onPressLocked,
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
          accessibilityLabel={`Bán kính tìm kiếm ${formatRadius(radiusKm)}`}
          accessibilityRole="button"
          onPress={isLocked ? onPressLocked : openRadius}
          style={[
            styles.radius,
            { backgroundColor: theme.primarySoft, borderColor: theme.backgroundSelected },
          ]}
        >
          <HomeIcon name={HomeIcons.location} color={theme.primary} size={15} />
          <Text style={[styles.radiusLabel, { color: theme.text }]}>Gần bạn</Text>
          <Text style={[styles.radiusValue, { color: theme.textSecondary }]}>
            · {formatRadius(radiusKm)}
          </Text>
          <HomeIcon name={HomeIcons.chevronDown} color={theme.textSecondary} size={15} />
        </Pressable>

        <Pressable
          accessibilityLabel={isLocked ? 'Tìm món hoặc quán' : undefined}
          accessibilityRole={isLocked ? 'button' : undefined}
          disabled={!isLocked}
          onPress={onPressLocked}
          style={[styles.search, { backgroundColor: theme.background, borderColor: theme.border }]}
        >
          <HomeIcon name={HomeIcons.search} color={theme.textSecondary} size={16} />
          {/* Khi bị khoá, ô nhập không nhận chạm để cú bấm rơi xuống Pressable bọc ngoài
              thay vì mở bàn phím. */}
          <View style={[styles.inputWrapper, isLocked && styles.passThrough]}>
            <TextInput
              accessibilityLabel="Tìm món hoặc quán"
              autoCorrect={false}
              editable={!isLocked}
              onChangeText={onChangeQuery}
              placeholder="Tìm món hoặc quán"
              placeholderTextColor={theme.textSecondary}
              returnKeyType="search"
              style={[styles.input, { color: theme.text }]}
              value={query}
            />
          </View>
          {query && !isLocked ? (
            <Pressable
              accessibilityLabel="Xoá từ khoá"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => onChangeQuery('')}
            >
              <HomeIcon name={HomeIcons.clear} color={theme.textSecondary} />
            </Pressable>
          ) : null}
        </Pressable>
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
    borderRadius: 22,
    paddingVertical: 10,
    boxShadow: '0px 12px 30px rgba(23, 33, 27, 0.08)',
  },
  row: { flexDirection: 'row', gap: 8, paddingHorizontal: 10 },
  radius: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderRadius: 19,
    paddingHorizontal: 10,
  },
  radiusLabel: { fontSize: 13, fontWeight: '700' },
  radiusValue: { fontSize: 13, fontWeight: '600' },
  search: {
    flex: 1,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 19,
    paddingHorizontal: 10,
  },
  inputWrapper: { flex: 1, minWidth: 0 },
  passThrough: { pointerEvents: 'none' },
  // Trình duyệt tự vẽ viền focus riêng, lệch khỏi khung bo tròn của ô tìm kiếm.
  input: { height: 36, fontSize: 13, outlineWidth: 0 },
});
