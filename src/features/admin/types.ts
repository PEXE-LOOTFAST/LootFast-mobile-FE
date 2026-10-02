import type { IconName } from '@/components/ui/icon';

/**
 * Bốn nhóm hồ sơ admin nhìn thấy. 'upload-failed' là hồ sơ mà ảnh giấy phép không lên được
 * storage — người gửi vẫn đang chờ, nhưng hồ sơ chưa vào hàng duyệt nên dễ bị bỏ quên.
 */
export type StoreApplicationStatus = 'pending' | 'approved' | 'rejected' | 'upload-failed';

export type StoreApplicationTagTone = 'primary' | 'warning';

/** Nhãn nhỏ dưới tên hồ sơ, vd. nhóm món hoặc số giấy phép kinh doanh. */
export type StoreApplicationTag = {
  label: string;
  icon?: IconName;
  tone: StoreApplicationTagTone;
};

/** Một dòng thông tin trong thẻ. Có `tel` thì bấm vào dòng đó để gọi. */
export type StoreApplicationInfoRow = {
  icon: IconName;
  label: string;
  tel?: string;
};

/**
 * Dữ liệu hiển thị của một thẻ trên màn Duyệt quán. Thẻ nhận đúng thứ nó vẽ chứ không nhận
 * nguyên hồ sơ, để đổi cách trình bày không phải sửa theo kiểu dữ liệu của API.
 */
export type StoreApplicationCardModel = {
  id: string;
  title: string;
  tags: StoreApplicationTag[];
  rows: StoreApplicationInfoRow[];
  status: StoreApplicationStatus;
  /** Lý do admin đã ghi khi từ chối; chỉ hồ sơ từ API mới có.  */
  rejectionReason?: string | null;
};

export type AdminStatTone = 'primary' | 'accent';

/** Một ô số liệu toàn sàn trên trang Tổng quan. `value` đã định dạng sẵn để hiển thị. */
export type AdminStat = {
  id: string;
  label: string;
  value: string;
  caption: string;
  icon: 'store' | 'people' | 'food' | 'wallet';
  tone: AdminStatTone;
};

/** Số suất deal bán ra toàn sàn trong một ngày, dùng cho biểu đồ 7 ngày. */
export type DailyPlatformSales = { key: string; label: string; count: number };

export type AdminAlertKind = 'warning' | 'info';

export type AdminAlert = {
  id: string;
  kind: AdminAlertKind;
  message: string;
  /** Thời gian tương đối đã định dạng sẵn, vd. "10 phút trước". */
  timeLabel: string;
};

export type ManagedAccountKind = 'store' | 'user';

export type ManagedAccountStatus = 'active' | 'locked';

/** Một quán hoặc người dùng trong danh sách Quản lý. */
export type ManagedAccount = {
  id: string;
  kind: ManagedAccountKind;
  name: string;
  /** Quán: quận/huyện, vd. "Q.10". Người dùng: số deal đã mua. */
  detail: string;
  status: ManagedAccountStatus;
};
