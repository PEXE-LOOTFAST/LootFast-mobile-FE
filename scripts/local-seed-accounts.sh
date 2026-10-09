#!/usr/bin/env bash
# Tạo sẵn 2 tài khoản TEST trong database local của BE (docker compose, container lootfast_postgres):
#   - admin  : admin.local@lootfast.test
#   - người mua: seller.local@lootfast.test (sẽ đăng ký bán hàng, admin duyệt để thành người bán)
# Chỉ dùng cho máy dev. Mật khẩu bên dưới là giá trị test, không phải tài khoản thật.
# Đăng ký thật cần OTP qua email (Brevo) nên local tạo thẳng vào DB, trạng thái VERIFIED.
set -euo pipefail

PASSWORD='LocalTest@123'
HASH=$(docker run --rm httpd:2.4-alpine htpasswd -bnBC 10 "" "$PASSWORD" | tr -d ':\n')

psql_exec() { docker exec -i lootfast_postgres psql -v ON_ERROR_STOP=1 -U "${DB_USERNAME:-lootfast}" -d "${DB_NAME:-lootfast}" "$@"; }

psql_exec <<SQL
INSERT INTO users (public_id, email, password_hash, first_name, last_name, role, status, created_at)
VALUES
  (gen_random_uuid(), 'admin.local@lootfast.test',  '$HASH', 'Admin',  'Local', 'ADMIN', 'VERIFIED', now()),
  (gen_random_uuid(), 'seller.local@lootfast.test', '$HASH', 'Quan',   'Local', 'BUYER', 'VERIFIED', now())
ON CONFLICT (email) DO NOTHING;
INSERT INTO user_roles (user_id, role)
SELECT id, role FROM users WHERE email IN ('admin.local@lootfast.test','seller.local@lootfast.test')
ON CONFLICT DO NOTHING;
SQL
echo "Đã tạo tài khoản test. Mật khẩu: xem biến PASSWORD trong file này."
