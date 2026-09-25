// Tài khoản quản trị mẫu cho tới khi có API xác thực. Chỉ dùng để thử giao diện:
// khi nối API, kiểm tra quyền phải làm ở server, không bao giờ so khớp ở client như thế này.
export const MOCK_ADMIN_ACCOUNT = {
  email: 'admin@lootfast.vn',
  password: 'admin123',
} as const;
