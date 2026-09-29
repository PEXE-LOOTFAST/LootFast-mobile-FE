export type StoreApplicationStatus = 'pending' | 'approved' | 'rejected';

/** Hồ sơ đăng ký mở quán mà người bán gửi lên, chờ quản trị duyệt trước khi được đăng deal. */
export type StoreApplication = {
  id: string;
  storeName: string;
  /** Nhóm món chính, vd. "Đồ ăn nhanh" — hiển thị nguyên văn trên thẻ. */
  category: string;
  ownerName: string;
  phone: string;
  address: string;
  /** Ngày gửi hồ sơ dạng "YYYY-MM-DD". */
  submittedAt: string;
  /** Đã nộp giấy chứng nhận an toàn thực phẩm hay chưa. */
  hasFoodSafetyCert: boolean;
  status: StoreApplicationStatus;
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
