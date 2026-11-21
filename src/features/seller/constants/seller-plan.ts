import type { IconName } from '@/components/ui/icon';
import { SellerIcons } from '@/features/seller/constants/icons';
import type { SellerPlanFeatureStatus } from '@/features/seller/types';

export const SELLER_PREMIUM_PRICE = 99000;

export const PLAN_FEATURE_STATUS_LABEL: Record<SellerPlanFeatureStatus, string> = {
  premium: 'Gói Cao cấp',
  soon: 'Sắp có',
};

export const SELLER_PLAN_FEATURES: {
  key: string;
  icon: IconName;
  title: string;
  status: SellerPlanFeatureStatus;
  description: string;
}[] = [
  {
    key: 'automation',
    icon: SellerIcons.schedule,
    title: 'Tự động hoá deal',
    status: 'premium',
    description: 'Sao chép deal đã có chỉ với một chạm. Lên lịch và deal lặp lại sẽ có sau.',
  },
  {
    key: 'smart-suggest',
    icon: SellerIcons.smartSuggest,
    title: 'Gợi ý Deal thông minh',
    status: 'premium',
    description:
      'Gợi ý số lượng, mức giảm và khung nhận từ lịch sử; không tự thay đổi giá khi chưa xác nhận.',
  },
  {
    key: 'advanced-report',
    icon: SellerIcons.report,
    title: 'Báo cáo nâng cao',
    status: 'premium',
    description: 'Hiệu suất deal, món bán chạy và khung nhận hiệu quả từ dữ liệu tổng hợp.',
  },
  {
    key: 'growth',
    icon: SellerIcons.megaphone,
    title: 'Chương trình tăng trưởng',
    status: 'soon',
    description: 'Xem điều kiện, nguồn tài trợ và ngân sách trước khi đăng ký chiến dịch.',
  },
  {
    key: 'priority-support',
    icon: SellerIcons.support,
    title: 'Hỗ trợ ưu tiên',
    status: 'soon',
    description: 'Hỗ trợ 1-1 sẽ có sau. Hiện bạn vẫn được hỗ trợ qua email ở mọi gói.',
  },
];

// Quy tắc gói còn chờ PO chốt trước khi mở thanh toán thật (không hiện cho người bán):
// - Deal nháp có tính lượt hay không.
// - Deal đã lên lịch tính lượt lúc tạo hay lúc kích hoạt.
// - Deal bị xoá, huỷ hoặc từ chối có hoàn lượt hay không.
// - Fair-use và giới hạn chống spam cho gói Cao cấp.
// - Giá gói, chu kỳ gia hạn và điều kiện huỷ.
// - Phí nền tảng, công thức đối soát và merchant payout tối thiểu.
