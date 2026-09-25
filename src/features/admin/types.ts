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
