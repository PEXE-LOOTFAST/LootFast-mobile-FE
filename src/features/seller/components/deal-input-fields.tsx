import { Text } from 'react-native';

import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/hooks/use-theme';
import { formatThousands } from '@/lib/format';

const MAX_PRICE_DIGITS = 7;

type PriceFieldProps = {
  label: string;
  /** Số thuần ("30000"); dấu chấm chỉ thêm khi hiển thị. */
  value: string;
  error?: string;
  placeholder?: string;
  onChange: (digits: string) => void;
};

export function PriceField({ label, value, error, placeholder, onChange }: PriceFieldProps) {
  const theme = useTheme();

  return (
    <TextField
      size="compact"
      error={error}
      keyboardType="number-pad"
      label={label}
      onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, MAX_PRICE_DIGITS))}
      placeholder={placeholder ? formatThousands(placeholder) : undefined}
      trailing={<Text style={{ color: theme.textSecondary, fontWeight: '700' }}>đ</Text>}
      value={formatThousands(value)}
    />
  );
}
