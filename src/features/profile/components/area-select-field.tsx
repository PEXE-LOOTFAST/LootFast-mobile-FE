import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Icon } from '@/components/ui/icon';
import { TextField } from '@/components/ui/text-field';
import { HomeIcons } from '@/features/home/constants/icons';
import { VN_AREAS } from '@/features/profile/constants/vn-areas';
import { useTheme } from '@/hooks/use-theme';
import { normalizeText } from '@/lib/text';

type CommuneEntry = {
  /** Tên đầy đủ hiển thị (kèm Phường/Xã/Đặc khu). */
  name: string;
  /** Giá trị lưu lên server: tên ngắn, bỏ tiền tố như seller thường viết trong địa chỉ quán. */
  value: string;
  kind: string;
  searchText: string;
};

type ProvinceEntry = {
  name: string;
  value: string;
  searchText: string;
  communes: CommuneEntry[];
};

const PROVINCE_PREFIX = /^(Thành phố|Tỉnh)\s+/;
const COMMUNE_PREFIX = /^(Phường|Xã|Đặc khu)\s+/;

const toProvinceValue = (name: string) => name.replace(PROVINCE_PREFIX, '');

// Giữ tiền tố khi tên bắt đầu bằng số ("Phường 1 Bảo Lộc"), vì bỏ đi sẽ thành "1 Bảo Lộc" khó hiểu.
function toCommuneValue(name: string) {
  const rest = name.replace(COMMUNE_PREFIX, '');

  return /^\d/.test(rest) ? name : rest;
}

const PROVINCES: ProvinceEntry[] = VN_AREAS.map(({ province, communes }) => ({
  name: province,
  value: toProvinceValue(province),
  searchText: normalizeText(province),
  communes: communes.map((name) => ({
    name,
    value: toCommuneValue(name),
    kind: COMMUNE_PREFIX.exec(name)?.[1] ?? 'Xã',
    searchText: normalizeText(name),
  })),
}));

type AreaPath = { province: ProvinceEntry; commune: CommuneEntry | null };

/**
 * Suy ngược tỉnh/xã từ giá trị đã lưu (server chỉ lưu tên ngắn). Tên xã trùng ở nhiều tỉnh thì không
 * xác định được tỉnh, khi đó trả null và ô chỉ hiện đúng giá trị đã lưu.
 */
function resolvePath(value: string): AreaPath | null {
  if (!value) return null;

  const province = PROVINCES.find((item) => item.value === value);
  if (province) return { province, commune: null };

  const hits = PROVINCES.flatMap((item) =>
    item.communes
      .filter((commune) => commune.value === value)
      .map((commune) => ({ province: item, commune })),
  );

  return hits.length === 1 ? (hits[0] ?? null) : null;
}

type AreaSelectFieldProps = {
  label: string;
  /** Khu vực đang lưu; rỗng là chưa chọn. */
  value: string;
  onChange: (value: string) => void;
  /** Chú thích ngắn hiện dưới ô. */
  description: string;
  /** Giải thích đầy đủ hiện trong cửa sổ chọn; bỏ trống thì dùng `description`. */
  detail?: string;
};

/**
 * Ô chọn khu vực theo bậc thang: tỉnh/thành trước, rồi xã/phường/đặc khu của tỉnh đó, mỗi bước có
 * tìm kiếm. Chỉ chọn được từ danh sách chuẩn để không gõ bừa (backend so khớp khu vực theo chữ nên
 * sai chính tả là không khớp).
 */
export function AreaSelectField({
  label,
  value,
  onChange,
  description,
  detail,
}: AreaSelectFieldProps) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  // Tỉnh đang xem ở bước 2; null là đang ở bước 1. Đặt ở đây để nút Back của Android lùi một bước.
  const [province, setProvince] = useState<ProvinceEntry | null>(null);

  const path = useMemo(() => resolvePath(value), [value]);
  const display = path
    ? path.commune
      ? `${path.province.value} › ${path.commune.value}`
      : path.province.value
    : value;

  const open = () => {
    // Mở lại thì nhảy thẳng tới tỉnh đã chọn để chỉnh xã/phường cho nhanh.
    setProvince(path?.province ?? null);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>

      <View style={styles.fieldRow}>
        <Pressable
          accessibilityHint="Mở danh sách để chọn tỉnh/thành rồi xã/phường"
          accessibilityLabel={`${label}: ${display || 'chưa chọn'}`}
          accessibilityRole="button"
          onPress={open}
          style={({ pressed }) => [
            styles.field,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            pressed && styles.pressed,
          ]}
        >
          <Icon name={HomeIcons.location} color={theme.textSecondary} size={16} />
          <Text
            numberOfLines={1}
            style={[styles.value, { color: display ? theme.text : theme.textSecondary }]}
          >
            {display || 'Chọn tỉnh/thành, xã/phường'}
          </Text>
          <Icon name={HomeIcons.chevronDown} color={theme.textSecondary} size={16} />
        </Pressable>

        {value ? (
          <Pressable
            accessibilityLabel="Xoá khu vực đã chọn"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => onChange('')}
            style={[styles.clear, { borderColor: theme.border }]}
          >
            <Icon name={HomeIcons.close} color={theme.textSecondary} size={14} />
          </Pressable>
        ) : null}
      </View>

      <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text>

      <Modal
        animationType="slide"
        // Android: nút Back lùi từ bước 2 về bước 1 trước, rồi mới đóng cửa sổ.
        onRequestClose={() => (province ? setProvince(null) : close())}
        statusBarTranslucent
        transparent={false}
        visible={isOpen}
      >
        {/* Chỉ dựng nội dung khi mở; key theo bước để ô tìm kiếm bắt đầu trống ở mỗi bước. */}
        {isOpen ? (
          <AreaPickerBody
            key={province?.name ?? 'provinces'}
            description={detail ?? description}
            onBack={() => setProvince(null)}
            onClose={close}
            onPickProvince={setProvince}
            onSelect={(next) => {
              onChange(next);
              close();
            }}
            province={province}
            selected={value}
            selectedPath={path}
          />
        ) : null}
      </Modal>
    </View>
  );
}

type PickerRow =
  | { kind: 'all'; key: string; title: string; hint: string; value: string }
  | { kind: 'province'; key: string; title: string; hint: string; province: ProvinceEntry }
  | { kind: 'commune'; key: string; title: string; hint: string; value: string };

type AreaPickerBodyProps = {
  province: ProvinceEntry | null;
  selected: string;
  selectedPath: AreaPath | null;
  description: string;
  onPickProvince: (province: ProvinceEntry) => void;
  onBack: () => void;
  onSelect: (value: string) => void;
  onClose: () => void;
};

function AreaPickerBody({
  province,
  selected,
  selectedPath,
  description,
  onPickProvince,
  onBack,
  onSelect,
  onClose,
}: AreaPickerBodyProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const keyword = normalizeText(query);

  const rows = useMemo<PickerRow[]>(() => {
    if (!province) {
      return PROVINCES.filter((item) => !keyword || item.searchText.includes(keyword)).map(
        (item) => ({
          kind: 'province',
          key: item.name,
          title: item.name,
          hint: `${item.communes.length} xã, phường, đặc khu`,
          province: item,
        }),
      );
    }

    const communes: PickerRow[] = province.communes
      .filter((commune) => !keyword || commune.searchText.includes(keyword))
      .map((commune) => ({
        kind: 'commune',
        key: commune.name,
        title: commune.name,
        hint: commune.kind,
        value: commune.value,
      }));

    // Cho phép chọn cả tỉnh/thành (khi chưa tìm kiếm) nếu người dùng muốn nhận thông báo rộng hơn.
    return keyword
      ? communes
      : [
          {
            kind: 'all',
            key: `all|${province.name}`,
            title: `Chọn cả ${province.name}`,
            hint: 'Nhận thông báo từ mọi xã, phường trong tỉnh/thành này',
            value: province.value,
          },
          ...communes,
        ];
  }, [province, keyword]);

  const isRowSelected = (row: PickerRow) => {
    if (row.kind === 'province') return selectedPath?.province.name === row.province.name;

    return row.value === selected && selectedPath?.province.name === province?.name;
  };

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: theme.background, paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        {province ? (
          <Pressable
            accessibilityLabel="Quay lại chọn tỉnh/thành"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onBack}
            style={styles.back}
          >
            <Icon name={HomeIcons.chevronLeft} color={theme.primary} size={16} />
            <Text style={[styles.cancel, { color: theme.primary }]}>Tỉnh/thành</Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityLabel="Đóng"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onClose}
          >
            <Text style={[styles.cancel, { color: theme.primary }]}>Huỷ</Text>
          </Pressable>
        )}
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          style={[styles.title, { color: theme.text }]}
        >
          {province ? province.value : 'Khu vực nhận món'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.steps}>
        <Text
          style={[
            styles.step,
            { color: province ? theme.textSecondary : theme.primary },
            !province && styles.stepActive,
          ]}
        >
          1. Tỉnh/Thành phố
        </Text>
        <Icon name={HomeIcons.chevronRight} color={theme.textSecondary} size={12} />
        <Text
          style={[
            styles.step,
            { color: province ? theme.primary : theme.textSecondary },
            province && styles.stepActive,
          ]}
        >
          2. Xã/Phường/Đặc khu
        </Text>
      </View>

      <View style={styles.searchArea}>
        <TextField
          autoCorrect={false}
          leading={<Icon name={HomeIcons.search} color={theme.textSecondary} size={16} />}
          onChangeText={setQuery}
          placeholder={province ? `Tìm xã, phường trong ${province.value}` : 'Tìm tỉnh/thành'}
          returnKeyType="search"
          size="compact"
          value={query}
        />
        <Text style={[styles.note, { color: theme.textSecondary }]}>{description}</Text>
        <Text style={[styles.note, { color: theme.textSecondary }]}>
          {province
            ? 'Chọn xã, phường hoặc đặc khu. Không cần gõ dấu khi tìm.'
            : 'Chọn tỉnh/thành trước, sau đó chọn xã, phường. Danh sách theo 34 tỉnh/thành sau sáp nhập.'}
        </Text>
      </View>

      <FlatList
        contentContainerStyle={styles.list}
        data={rows}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(row) => row.key}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.textSecondary }]}>
            {province
              ? 'Không tìm thấy xã, phường phù hợp. Thử gõ ngắn hơn hoặc quay lại chọn cả tỉnh/thành.'
              : 'Không tìm thấy tỉnh/thành phù hợp. Thử gõ ngắn hơn.'}
          </Text>
        }
        renderItem={({ item }) => {
          const isSelected = isRowSelected(item);

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() =>
                item.kind === 'province' ? onPickProvince(item.province) : onSelect(item.value)
              }
              style={({ pressed }) => [
                styles.option,
                { borderBottomColor: theme.border },
                isSelected && { backgroundColor: theme.primarySoft },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.optionCopy}>
                <Text
                  style={[
                    styles.optionTitle,
                    { color: item.kind === 'all' ? theme.primary : theme.text },
                  ]}
                >
                  {item.title}
                </Text>
                <Text style={[styles.optionHint, { color: theme.textSecondary }]}>{item.hint}</Text>
              </View>
              {isSelected ? <Icon name={HomeIcons.check} color={theme.primary} size={18} /> : null}
              {item.kind === 'province' ? (
                <Icon name={HomeIcons.chevronRight} color={theme.textSecondary} size={16} />
              ) : null}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: FontSize.footnote, fontWeight: FontWeight.bold },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  field: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
  },
  value: { flex: 1, fontSize: FontSize.body },
  clear: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.full,
  },
  description: { fontSize: FontSize.footnote, lineHeight: 17 },
  pressed: { opacity: 0.8 },
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  back: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  cancel: { fontSize: FontSize.bodyLg, fontWeight: FontWeight.bold },
  title: { flex: 1, fontSize: FontSize.title, fontWeight: FontWeight.heavy, textAlign: 'center' },
  headerSpacer: { width: 72 },
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  step: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium },
  stepActive: { fontWeight: FontWeight.heavy },
  searchArea: { gap: Spacing.sm, padding: Spacing.lg, paddingBottom: Spacing.sm },
  note: { fontSize: FontSize.footnote, lineHeight: 17 },
  list: { paddingBottom: Spacing.xxl },
  empty: { padding: Spacing.xxl, fontSize: FontSize.bodySm, lineHeight: 19, textAlign: 'center' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  optionCopy: { flex: 1, gap: Spacing.xxs },
  optionTitle: { fontSize: FontSize.bodyLg, fontWeight: FontWeight.bold },
  optionHint: { fontSize: FontSize.footnote },
});
