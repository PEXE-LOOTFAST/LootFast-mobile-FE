import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  getSuggestedPlace,
  suggestAddresses,
  type AddressSuggestion,
} from '@/features/map/api/geocode';
import { useTheme } from '@/hooks/use-theme';

type AddressSuggestionsProps = {
  /** Chữ người bán đang gõ; để trống thì không gợi ý (ví dụ khi giá trị chỉ được nạp sẵn). */
  query: string;
  onSelect: (place: Awaited<ReturnType<typeof getSuggestedPlace>>) => void;
};

const MIN_QUERY_LENGTH = 3;

/** Danh sách địa chỉ có thật ở Việt Nam để người bán chọn thay vì gõ tự do. */
export function AddressSuggestions({ query, onSelect }: AddressSuggestionsProps) {
  const theme = useTheme();
  const [items, setItems] = useState<AddressSuggestion[]>([]);

  useEffect(() => {
    const text = query.trim();
    if (text.length < MIN_QUERY_LENGTH) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      suggestAddresses(text, controller.signal)
        .then(setItems)
        .catch(() => setItems([]));
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Gợi ý cũ còn trong state khi chữ gõ đã ngắn lại (hoặc đã chọn xong) thì không hiện.
  if (query.trim().length < MIN_QUERY_LENGTH || !items.length) return null;

  async function choose(item: AddressSuggestion) {
    setItems([]);
    try {
      onSelect(await getSuggestedPlace(item.placeId));
    } catch {
      // Chọn lỗi thì người bán vẫn gõ tay được; lúc lưu địa chỉ sẽ được kiểm tra lại.
    }
  }

  return (
    <View
      style={[styles.list, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      {items.slice(0, 5).map((item) => (
        <Pressable
          accessibilityRole="button"
          key={item.placeId}
          onPress={() => void choose(item)}
          style={({ pressed }) => [styles.item, pressed && { backgroundColor: theme.primarySoft }]}
        >
          <Text style={[styles.text, { color: theme.text }]}>{item.description}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  item: { paddingHorizontal: 14, paddingVertical: 10 },
  text: { fontSize: 13, fontWeight: '600' },
});
