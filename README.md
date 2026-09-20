# LootFast — Mobile App

App đặt giữ suất ăn giảm giá cuối ngày từ các cửa hàng F&B gần bạn. Khách đặt qua app rồi tự đến cửa hàng nhận (self-pickup, không giao hàng).

Đây là repo **frontend mobile**. Backend nằm ở repo riêng.

---

## Tech stack

| Thành phần    | Công nghệ                         | Ghi chú                                        |
| ------------- | --------------------------------- | ---------------------------------------------- |
| Framework     | Expo SDK 57 + React Native 0.86   |                                                |
| Ngôn ngữ      | TypeScript 6 (strict)             |                                                |
| Routing       | Expo Router 57                    | File-based — tên file chính là đường dẫn       |
| Server state  | TanStack Query v5                 | Cache, retry, loading state cho dữ liệu từ API |
| Lưu token     | expo-secure-store                 | Mã hoá bởi hệ điều hành                        |
| Lint / Format | ESLint 9 + Prettier 3             |                                                |
| Git hooks     | husky + lint-staged               |                                                |
| Commit        | commitlint (conventional commits) |                                                |
| CI            | GitHub Actions                    | Chạy typecheck + lint trên mỗi PR              |

---

## Cần cài sẵn trên máy

| Thứ         | Phiên bản                  | Link                          |
| ----------- | -------------------------- | ----------------------------- |
| **Node.js** | 22 LTS (tối thiểu 20.19.4) | https://nodejs.org            |
| **Git**     | bản mới nhất               | https://git-scm.com           |
| **Expo Go** | app trên điện thoại        | Tải từ CH Play hoặc App Store |
| VS Code     | khuyến nghị                | https://code.visualstudio.com |

Kiểm tra Node đã đúng chưa:

```bash
node -v     # phải >= v20.19.4
```

> **Không cần cài Android Studio hay Xcode.** Expo Go lo phần chạy app trên điện thoại thật.

---

## Chạy lần đầu sau khi clone

```bash
git clone <url-repo>
cd lootfast-mobile-fe

npm install          # cài thư viện + tự cài git hook (husky)
cp .env.example .env # tạo file biến môi trường
npm start            # khởi động dev server
```

Lệnh `cp` chạy được trên Git Bash, macOS/Linux và cả PowerShell (PowerShell có sẵn alias `cp`). Riêng Command Prompt (`cmd.exe`) thì dùng:

```
copy .env.example .env
```

Ba lệnh đó chỉ chạy **một lần duy nhất** lúc mới clone. Những lần sau chỉ cần `npm start`.

> `npm install` tự động chạy `husky` nhờ script `prepare` trong `package.json`. Không cần gõ lệnh cài hook riêng.

---

## Kết nối điện thoại với Expo Go

Sau khi chạy `npm start`, terminal hiện một **mã QR**.

1. **Điện thoại và máy tính phải chung một mạng WiFi.** Đây là lỗi phổ biến nhất — máy tính cắm dây LAN còn điện thoại dùng WiFi là không thấy nhau.
2. Mở app **Expo Go** trên điện thoại
3. **Android:** bấm "Scan QR code" ngay trong Expo Go
   **iOS:** mở app Camera mặc định quét QR, nó sẽ hỏi mở Expo Go
4. Chờ khoảng 10–30 giây lần đầu (Metro đang đóng gói JavaScript)

Sửa code và lưu file → app tự cập nhật ngay, không cần quét lại.

### Nếu không kết nối được

```bash
npx expo start --tunnel
```

Chế độ tunnel đi vòng qua server của Expo, chạy được cả khi khác mạng. Đổi lại tốc độ chậm hơn. Dùng khi WiFi trường chặn kết nối giữa các thiết bị, hoặc khi Windows Firewall chặn Node.

---

## Bảng lệnh

| Lệnh                | Việc nó làm                                                 |
| ------------------- | ----------------------------------------------------------- |
| `npm start`         | Khởi động dev server, hiện QR để quét bằng Expo Go          |
| `npm run android`   | Mở thẳng trên máy ảo Android (cần Android Studio)           |
| `npm run ios`       | Mở thẳng trên máy ảo iOS (chỉ macOS)                        |
| `npm run web`       | Mở trên trình duyệt — chỉ để xem nhanh, không phải mục tiêu |
| `npm run typecheck` | Kiểm tra lỗi TypeScript toàn project                        |
| `npm run lint`      | Kiểm tra lỗi code style / logic                             |
| `npm run format`    | Format lại toàn bộ file bằng Prettier                       |

> Dự án này **không có** `npm run dev` như web React — lệnh tương đương là `npm start`.

### Phím tắt khi dev server đang chạy

| Phím           | Tác dụng                       |
| -------------- | ------------------------------ |
| `a`            | Mở trên Android                |
| `i`            | Mở trên iOS                    |
| `w`            | Mở trên trình duyệt            |
| `r`            | Tải lại app                    |
| `j`            | Mở debugger                    |
| `m`            | Bật/tắt menu dev trên thiết bị |
| **`Ctrl + C`** | **Tắt dev server**             |

Tắt bằng `Ctrl + C` (Windows và macOS đều vậy, không phải `Cmd + C`). Nếu terminal treo, bấm `Ctrl + C` lần nữa.

---

## Cấu trúc thư mục

```
src/
├── app/                      # CHỈ routing — Expo Router đọc thư mục này
│   ├── _layout.tsx           # Layout gốc: Stack + Theme + QueryClient
│   ├── (auth)/               # Nhóm màn chưa đăng nhập — KHÔNG có thanh tab
│   │   ├── _layout.tsx
│   │   └── login.tsx         # → /login
│   ├── (tabs)/               # Nhóm màn chính — CÓ thanh tab
│   │   ├── _layout.tsx       # Khai báo các tab
│   │   ├── index.tsx         # → /
│   │   └── orders.tsx        # → /orders
│   └── +not-found.tsx        # Màn 404
├── features/                 # Chia theo nghiệp vụ
│   └── auth/
│       ├── api/              # Gọi API + hook TanStack Query
│       └── components/       # Component chỉ dùng trong feature này
├── components/ui/            # Component dùng chung (Button, Input, ...)
├── lib/                      # Hạ tầng dùng chung
│   ├── api-client.ts         # Bọc fetch, gắn token, bóc ApiResponse
│   ├── query-client.ts       # Cấu hình TanStack Query
│   └── storage.ts            # Lưu/đọc token an toàn
├── hooks/                    # Hook dùng chung
├── constants/                # theme.ts — màu, spacing
└── types/                    # Type dùng chung (ApiResponse...)
```

### Cách thêm màn hình mới

Tạo file trong `src/app/(tabs)/` là xong — route có ngay, không cần khai báo ở đâu khác.

```
src/app/(tabs)/profile.tsx   →  /profile
src/app/deals/[id].tsx       →  /deals/123
```

**Thư mục trong ngoặc đơn không xuất hiện trong URL.** `(auth)/login.tsx` cho ra `/login`, không phải `/auth/login`. Ngoặc đơn chỉ dùng để gom nhóm và gắn layout riêng.

Muốn thêm tab mới: tạo file trong `(tabs)/` rồi thêm một `<NativeTabs.Trigger>` trong `(tabs)/_layout.tsx`.

---

## Ba quy tắc bắt buộc

Review PR sẽ soi đúng ba điều này.

### 1. File trong `src/app/` phải mỏng

Chỉ import screen component từ `features/` rồi render. Thấy logic gọi API hay quản lý state nằm trong `app/` là **trả PR**.

```tsx
// ĐÚNG — src/app/(tabs)/orders.tsx
import { OrderListScreen } from '@/features/order/components/order-list-screen';
export default OrderListScreen;

// SAI — logic fetch nằm trong app/
export default function OrdersScreen() {
  const { data } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders });
  // ...
}
```

Lý do: `app/` là phần routing của framework. Trộn logic nghiệp vụ vào đó khiến không test được và không tái dùng được.

### 2. Feature không import chéo feature

`features/order` **không được** import từ `features/auth`. Cần dùng chung thì kéo xuống `lib/` hoặc `components/ui/`.

Lý do: import chéo tạo phụ thuộc vòng, sửa một feature làm vỡ feature khác.

### 3. Không có thư mục `utils/` rác

Muốn viết hàm tiện ích thì đặt đúng chỗ nó thuộc về. Hàm format tiền → `lib/format.ts`. Hàm chỉ dùng trong auth → `features/auth/`.

Lý do: `utils/` luôn phình thành bãi rác không ai dám dọn.

---

## Quy ước code

### Đặt tên file — kebab-case

```
use-login.ts          ĐÚNG
useLogin.ts           SAI

order-card.tsx        ĐÚNG
OrderCard.tsx         SAI
```

Tên **component bên trong** file vẫn là PascalCase: `export function OrderCard()`.

### Import dùng alias `@/`

```tsx
import { apiRequest } from '@/lib/api-client'; // ĐÚNG
import { apiRequest } from '../../lib/api-client'; // SAI
```

`@/` trỏ tới `src/`, `@/assets/` trỏ tới `assets/`.

### Comment — giải thích TẠI SAO, không phải CÁI GÌ

Mặc định **không viết comment**. Code đặt tên rõ ràng đã tự giải thích nó làm gì. Chỉ viết comment khi có lý do ẩn mà đọc code không thấy được: một ràng buộc, một cách làm né lỗi cụ thể, một con số được chọn có chủ đích.

```ts
// SAI — mô tả lại điều code đã nói
// Lấy access token từ storage
const token = await tokenStorage.getAccessToken();

// ĐÚNG — giải thích lý do không đoán được từ code
// SecureStore không có bản cho web — gọi thẳng sẽ làm `npm run web` crash.
if (isWeb) return globalThis.localStorage.getItem(key);

// ĐÚNG — giải thích vì sao là 1 chứ không phải 3
// Mạng di động hay chập chờn nên vẫn retry, nhưng chỉ 1 lần —
// mặc định 3 lần khiến người dùng chờ khá lâu mới thấy thông báo lỗi.
retry: 1,
```

Đừng ghi comment kiểu "sửa cho ticket #12" hay "dùng bởi màn X" — những thứ đó thuộc về mô tả PR và sẽ lạc hậu rất nhanh.

---

## Quy ước commit

Định dạng bắt buộc: `<loại>(<phạm vi>): <mô tả>`

Phạm vi `(...)` không bắt buộc.

```bash
git commit -m "feat(auth): them man hinh dang nhap"
git commit -m "fix: sua loi hien gia am"
git commit -m "chore: cap nhat dependencies"
```

### Loại được phép

| Loại                      | Dùng khi                               |
| ------------------------- | -------------------------------------- |
| `feat`                    | Thêm tính năng mới                     |
| `fix`                     | Sửa lỗi                                |
| `chore`                   | Việc lặt vặt: cập nhật package, config |
| `refactor`                | Sửa code nhưng không đổi hành vi       |
| `docs`                    | Sửa tài liệu                           |
| `test`                    | Thêm/sửa test                          |
| `style`                   | Chỉ đổi format, không đổi logic        |
| `perf`                    | Cải thiện hiệu năng                    |
| `build` · `ci` · `revert` | Ít dùng                                |

### Ba lỗi hay mắc

| Câu lệnh                                     | Kết quả                                       |
| -------------------------------------------- | --------------------------------------------- |
| `git commit -m "them man hinh login"`        | **Chặn** — thiếu loại                         |
| `git commit -m "feat: Them man hinh login"`  | **Chặn** — chữ đầu mô tả phải **viết thường** |
| `git commit -m "feat: them man hinh login."` | **Chặn** — không được có dấu chấm cuối câu    |
| `git commit -m "feat: them man hinh login"`  | Qua                                           |

> Nên viết message **không dấu**. `git commit -m` trên PowerShell hay lỗi encoding với tiếng Việt có dấu.

---

## Git hooks (husky)

Ba hook chạy tự động, không cần gõ lệnh gì:

| Thời điểm            | Việc chạy                                                       | Mất bao lâu |
| -------------------- | --------------------------------------------------------------- | ----------- |
| **Khi commit**       | Prettier format + ESLint fix, **chỉ trên file bạn đang commit** | ~10–30 giây |
| **Khi viết message** | commitlint kiểm tra định dạng                                   | tức thì     |
| **Khi push**         | `npm run typecheck` toàn project                                | ~30 giây    |

Thiết kế này cố ý: việc nhanh đặt ở commit, việc chậm đặt ở push. Nếu bắt typecheck mỗi lần commit thì không ai chịu nổi.

Hook tự sửa file được thì nó sửa và stage lại luôn. Sửa không được thì chặn commit và in lỗi ra.

> **Đừng dùng `--no-verify` để né hook.** Hook chặn nghĩa là code thật sự có vấn đề — né được ở máy bạn nhưng CI trên GitHub sẽ chặn tiếp, chỉ tốn thêm thời gian.

---

## Quy trình Git

Nhánh `main` = code đã phát hành. Nhánh `develop` = nhánh tích hợp. **Không code thẳng lên hai nhánh này.**

```bash
git switch develop
git pull

git switch -c feat/man-hinh-dang-nhap    # hoặc fix/ten-loi

# ... code ...

git add .
git commit -m "feat(auth): them man hinh dang nhap"
git push -u origin feat/man-hinh-dang-nhap
```

Rồi lên GitHub mở Pull Request **vào `develop`** (không phải `main`), chọn **Squash and merge**.

CI sẽ tự chạy `typecheck` + `lint` trên mỗi PR. Phải xanh mới được merge.

`develop` → `main` chỉ khi phát hành phiên bản.

### Đặt tên nhánh

```
<loại>/<đối tượng>/<mô tả ngắn>
```

| Phần           | Giá trị                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| `<loại>`       | `feat`, `fix`, `refactor`, `chore`, `docs`                                                                    |
| `<đối tượng>`  | `buyer` (người mua), `seller` (người bán), `admin` (quản trị), `shared` (dùng chung: theme, tab bar, lib, CI) |
| `<mô tả ngắn>` | không dấu, nối bằng `-`                                                                                       |

```bash
git switch -c feat/seller/overview-page-ui     # Tổng quan của người bán
git switch -c feat/buyer/checkout-ui           # Thanh toán của người mua
git switch -c feat/admin/store-approval-ui     # Duyệt quán của admin
git switch -c fix/shared/tab-bar-safe-area     # Lỗi ở phần dùng chung
```

Một app có ba nhóm người dùng hoàn toàn khác nhau, nên nhìn tên nhánh phải biết ngay
nó đụng vào màn hình của ai — `feat/order-page-ui` thì không nói được đó là đơn của
người mua hay đơn của quán. Quy ước này **chỉ áp dụng cho nhánh tạo mới từ giờ**;
các nhánh và PR đang mở giữ nguyên tên cũ, không đổi.

---

## Biến môi trường.

File `.env` (đã nằm trong `.gitignore`, không commit):

```
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
```

**Cảnh báo bảo mật:** biến có tiền tố `EXPO_PUBLIC_` được **nhúng thẳng vào file APK**. Ai tải app về cũng đọc được. Tuyệt đối không đặt JWT secret, PayOS key hay bất kỳ khoá bí mật nào ở đây — chúng chỉ được sống ở backend.

Sau khi sửa `.env` phải khởi động lại, vì env **không hot-reload**:

```bash
npx expo start --clear
```

---

## Xử lý sự cố

| Hiện tượng                         | Cách xử lý                                                                                   |
| ---------------------------------- | -------------------------------------------------------------------------------------------- |
| Quét QR mà không kết nối được      | Kiểm tra điện thoại và máy tính **chung WiFi**. Vẫn không được thì `npx expo start --tunnel` |
| Sửa `.env` mà app không nhận       | `npx expo start --clear`                                                                     |
| App lỗi lạ sau khi cài package mới | `npx expo start --clear`                                                                     |
| `npm install` lỗi tùm lum          | Xoá `node_modules` và `package-lock.json`, chạy lại `npm install`                            |
| Commit bị chặn                     | Đọc kỹ dòng lỗi — thường là sai định dạng message hoặc ESLint báo lỗi thật                   |
| Hook không chạy                    | Chạy `npm install` lại (nó cài hook qua script `prepare`)                                    |
| CI đỏ mà máy mình xanh             | Chạy `npm run typecheck` và `npm run lint` ở máy — CI chạy đúng hai lệnh đó                  |

---

## Ghi chú

- **Không cần** Android Studio / Xcode để phát triển. Chỉ cần khi build file cài đặt thật.
- Bản web (`npm run web`) chỉ để xem nhanh, **không phải mục tiêu** của dự án.
- Chưa dùng EAS Build. Khi nào cần push notification, quét QR hay bản đồ thì mới phải chuyển sang development build.
