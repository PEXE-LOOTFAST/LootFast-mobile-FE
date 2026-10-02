import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { InlineAlert } from '@/components/ui/inline-alert';
import { TextField } from '@/components/ui/text-field';
import {
  toBankAccountErrorMessage,
  type MerchantBankAccountDto,
} from '@/features/seller/api/bank-account';
import { useBankAccount, useUpdateBankAccount } from '@/features/seller/api/use-bank-account';
import { SellerFormCard } from '@/features/seller/components/seller-form-card';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { useTheme } from '@/hooks/use-theme';
import { ApiException } from '@/lib/api-client';

const BIN_PATTERN = /^\d{6}$/;
const ACCOUNT_PATTERN = /^\d{6,19}$/;

type BankAccountErrors = Partial<
  Record<'bankBin' | 'bankName' | 'accountNumber' | 'holder', string>
>;

/**
 * Tài khoản nhận tiền của quán. Backend kiểm chặt mã BIN và số tài khoản phải toàn chữ số vì
 * hai giá trị này đi thẳng vào mã VietQR in cho khách chuyển khoản.
 *
 * Form chỉ dựng sau khi biết kết quả gọi API: giá trị ban đầu nằm trong useState nên mount
 * sớm thì các ô sẽ trống dù dữ liệu về sau đó.
 */
export function SellerBankAccountScreen() {
  const theme = useTheme();
  const accountQuery = useBankAccount();

  const account = accountQuery.data;
  const notConfigured =
    accountQuery.error instanceof ApiException &&
    accountQuery.error.code === 'BANK_ACCOUNT_NOT_FOUND';

  return (
    <SellerPageScaffold
      onPressBack={() => router.navigate('/seller/settings')}
      subtitle="Nơi LootFast chuyển tiền bán deal cho quán"
      title="Tài khoản nhận tiền"
    >
      {accountQuery.isLoading ? <ActivityIndicator color={theme.primary} /> : null}

      {accountQuery.error && !notConfigured ? (
        <InlineAlert message={toBankAccountErrorMessage(accountQuery.error)} />
      ) : null}

      {notConfigured ? (
        <Text style={[styles.note, { color: theme.textSecondary }]}>
          Quán chưa có tài khoản nhận tiền. Điền thông tin bên dưới để khách chuyển khoản được.
        </Text>
      ) : null}

      {accountQuery.isLoading ? null : <BankAccountForm account={account} />}
    </SellerPageScaffold>
  );
}

function BankAccountForm({ account }: { account?: MerchantBankAccountDto }) {
  const update = useUpdateBankAccount();
  const [bankBin, setBankBin] = useState(account?.bankBin ?? '');
  const [bankName, setBankName] = useState(account?.bankName ?? '');
  const [accountNumber, setAccountNumber] = useState(account?.accountNumber ?? '');
  const [holder, setHolder] = useState(account?.accountHolderName ?? '');
  const [errors, setErrors] = useState<BankAccountErrors>({});
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const next: BankAccountErrors = {
      bankBin: BIN_PATTERN.test(bankBin.trim()) ? undefined : 'Mã BIN gồm đúng 6 chữ số',
      bankName: bankName.trim() ? undefined : 'Vui lòng nhập tên ngân hàng',
      accountNumber: ACCOUNT_PATTERN.test(accountNumber.trim())
        ? undefined
        : 'Số tài khoản gồm 6–19 chữ số',
      holder: holder.trim() ? undefined : 'Vui lòng nhập tên chủ tài khoản',
    };

    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSaved(false);
    update.mutate(
      {
        bankBin: bankBin.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountHolderName: holder.trim(),
      },
      { onSuccess: () => setSaved(true) },
    );
  };

  return (
    <>
      <SellerFormCard>
        <TextField
          size="compact"
          error={errors.bankBin}
          keyboardType="number-pad"
          label="Mã BIN ngân hàng"
          maxLength={6}
          onChangeText={setBankBin}
          placeholder="970436"
          value={bankBin}
        />
        <TextField
          size="compact"
          error={errors.bankName}
          label="Tên ngân hàng"
          maxLength={100}
          onChangeText={setBankName}
          placeholder="Vietcombank"
          value={bankName}
        />
        <TextField
          size="compact"
          error={errors.accountNumber}
          keyboardType="number-pad"
          label="Số tài khoản"
          maxLength={19}
          onChangeText={setAccountNumber}
          placeholder="0123456789"
          value={accountNumber}
        />
        <TextField
          size="compact"
          autoCapitalize="characters"
          error={errors.holder}
          label="Tên chủ tài khoản"
          maxLength={120}
          onChangeText={setHolder}
          placeholder="NGUYEN VAN A"
          value={holder}
        />
      </SellerFormCard>

      {update.error ? <InlineAlert message={toBankAccountErrorMessage(update.error)} /> : null}
      {saved ? <InlineAlert message="Đã lưu tài khoản nhận tiền." tone="success" /> : null}

      <BrandButton loading={update.isPending} onPress={handleSave}>
        Lưu tài khoản
      </BrandButton>
    </>
  );
}

const styles = StyleSheet.create({
  note: { fontSize: 13, lineHeight: 19 },
});
