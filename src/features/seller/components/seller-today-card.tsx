import { router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { toSellerDeal, useMerchantDeals } from '@/features/seller/api/use-merchant-deals';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useTodayOrders } from '@/features/seller/hooks/use-new-order-alerts';
import { useTheme } from '@/hooks/use-theme';

/**
 * Hai việc người bán cần biết ngay khi mở app: còn bao nhiêu khách sắp tới lấy món, và quán đang
 * có deal nào bán không. Bấm vào là tới đúng mục ở tab Đơn hàng; chưa có deal thì mời đăng.
 */
export function SellerTodayCard() {
  const { waitingCount, isLoading: ordersLoading } = useTodayOrders();
  const dealsQuery = useMerchantDeals();

  const running = (dealsQuery.data?.items ?? [])
    .map(toSellerDeal)
    // Nháp chưa lên trang người mua nên không tính là đang bán.
    .filter((deal) => deal.status === 'running' && !deal.isDraft);
  const portionsLeft = running.reduce(
    (sum, deal) => sum + Math.max(deal.portionsTotal - deal.portionsSold, 0),
    0,
  );

  return (
    <View style={styles.section}>
      <AppText accessibilityRole="header" variant="bodyLg" weight="heavy">
        Ngay lúc này
      </AppText>

      <View style={styles.row}>
        <TodayTile
          caption={waitingCount > 0 ? 'Mở danh sách đơn' : 'Đơn mới sẽ hiện ở đây'}
          href={{ pathname: '/seller/orders', params: { view: 'incoming' } }}
          icon={SellerIcons.bag}
          label="Khách sắp tới lấy"
          value={ordersLoading ? '…' : `${waitingCount} đơn`}
          highlight={waitingCount > 0}
        />

        {dealsQuery.isLoading || running.length > 0 ? (
          <TodayTile
            caption={dealsQuery.isLoading ? ' ' : `Còn ${portionsLeft} phần chưa bán`}
            href={{ pathname: '/seller/orders', params: { view: 'running' } }}
            icon={SellerIcons.tag}
            label="Deal đang bán"
            value={dealsQuery.isLoading ? '…' : `${running.length} deal`}
          />
        ) : (
          <TodayTile
            caption="Bán nốt món còn dư hôm nay"
            href="/seller/new-deal"
            icon={SellerIcons.plus}
            label="Chưa có deal đang bán"
            value="Đăng deal"
            highlight
          />
        )}
      </View>
    </View>
  );
}

type TodayTileProps = {
  icon: IconName;
  label: string;
  value: string;
  caption: string;
  href: Href;
  /** Ô cần người bán để ý (có khách sắp tới, chưa có deal) nổi lên bằng nền xanh nhạt. */
  highlight?: boolean;
};

function TodayTile({ icon, label, value, caption, href, highlight = false }: TodayTileProps) {
  const theme = useTheme();

  return (
    <Card
      accessibilityLabel={`${label}: ${value}. ${caption}`}
      gap="xs"
      onPress={() => router.navigate(href)}
      padding="md"
      style={styles.tile}
      tone={highlight ? 'soft' : 'default'}
    >
      <View style={styles.tileTop}>
        <View
          style={[
            styles.tileIcon,
            { backgroundColor: highlight ? theme.backgroundElement : theme.primarySoft },
          ]}
        >
          <Icon name={icon} color={theme.primary} size={18} />
        </View>
        <Icon name={SellerIcons.chevronRight} color={theme.textSecondary} size={18} />
      </View>
      <AppText numberOfLines={1} tone="textSecondary" variant="footnote" weight="bold">
        {label}
      </AppText>
      <AppText
        numberOfLines={1}
        tone={highlight ? 'primary' : 'text'}
        variant="title"
        weight="heavy"
      >
        {value}
      </AppText>
      <AppText numberOfLines={1} tone="textSecondary" variant="caption">
        {caption}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.sm },
  row: { flexDirection: 'row', gap: Spacing.md },
  tile: { flex: 1 },
  tileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  tileIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
});
