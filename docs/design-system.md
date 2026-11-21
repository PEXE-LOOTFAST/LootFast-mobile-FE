# Design system

Mọi giá trị giao diện (màu, khoảng cách, cỡ chữ, bo góc, đổ bóng) nằm trong `src/constants/theme/` và import qua `@/constants/theme`. Component dùng chung nằm trong `src/components/ui/`. Màn mới ráp từ hai chỗ này, không tự viết số hay mã màu.

ESLint (`eslint.config.js`) chặn mã hex, `rgb()`/`rgba()`, và `fontSize`/`fontWeight`/`borderRadius` viết số ở mọi file trong `src`, trừ `src/constants/theme/`. Pre-commit sẽ báo lỗi nếu viết cứng.

## Token

| Nhóm         | Tên                                                                                      | Giá trị                             |
| ------------ | ---------------------------------------------------------------------------------------- | ----------------------------------- |
| `Spacing`    | `none xxs xs sm md lg xl xxl xxxl huge`                                                  | 0 2 4 8 12 16 20 24 32 48           |
| `Radius`     | `none xs sm md lg xl xxl full`                                                           | 0 4 8 12 16 20 24 999               |
| `FontSize`   | `micro caption footnote bodySm body bodyLg subtitle title titleLg headline display hero` | 10 11 12 13 14 15 16 18 20 22 28 34 |
| `FontWeight` | `regular medium bold heavy`                                                              | 400 600 700 800                     |
| `Shadow`     | `card raised floating overlay tabBar brand brandStrong`                                  | chuỗi `boxShadow`                   |

`ScreenGutter` (lề trái/phải của màn, bằng `Spacing.lg`) và `MaxContentWidth` (800, bề rộng tối đa trên tablet/web) cũng lấy từ đây.

Khoảng cách lệch thang (6, 10, 14…) vẫn còn ở vài chỗ cũ và được giữ nguyên để không xô lệch bố cục. Code mới nên dùng đúng bậc của `Spacing`.

## Màu

**Màu theo chế độ sáng/tối** lấy qua `useTheme()`, không import `Colors` trực tiếp:

- `text`, `textSecondary`: chữ chính và chữ phụ.
- `background`, `backgroundElement`, `backgroundSelected`: nền màn, nền thẻ, nền mục đang chọn.
- `primary`, `primarySoft`, `accent`, `danger`, `border`.
- `onPrimary`, `onAccent`, `onDanger`: chữ/icon **đặt trên** nền `primary`, `accent`, `danger`. Ở dark mode `primary` và `danger` là màu sáng, chữ trắng trên đó gần như không đọc được, nên luôn dùng các token `on…` thay vì `#FFFFFF`.

**Màu cố định**, không đổi theo chế độ:

- `StaticColors`: `white`, `black`, `backdrop` / `backdropStrong` (nền mờ sau dialog), `imageScrim` (lớp tối trên ảnh), `cameraScrim`.
- `PremiumColors[scheme]`: bảng màu xanh dương riêng của gói Cao cấp.
- `IndicatorColor`, `RatingColor`, `UserLocationColor`: chấm trạng thái, sao đánh giá, chấm vị trí trên bản đồ.

Cần màu mới thì thêm token vào `src/constants/theme/colors.ts` kèm comment giải thích vì sao, rồi dùng token đó.

## Component dùng chung

| Component                                                | Dùng cho                                                                                                                                                |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AppText`                                                | Mọi đoạn chữ. `variant` là bậc `FontSize`, `tone` là màu theo vai trò (`textSecondary`, `primary`, `onPrimary`…), `weight` tự đậm với tiêu đề.          |
| `Screen`                                                 | Khung màn: nền, header cố định, vùng cuộn có kéo-để-làm-mới, lề và bề rộng tối đa. `keyboardAware` cho màn có ô nhập, `scroll={false}` cho màn tự cuộn. |
| `ScreenList`                                             | Như `Screen` nhưng dựng trên FlatList, cho màn chủ yếu là một danh sách dài. Có `onEndReached` và `loadingMore` để tải thêm khi cuộn.                   |
| `QueryBoundary`                                          | Bốn trạng thái của một truy vấn: đang tải, lỗi kèm Thử lại, rỗng, có dữ liệu.                                                                           |
| `QueryListEmpty`                                         | Truyền vào `empty` của `ScreenList`: phủ lúc tải lần đầu, lỗi và danh sách rỗng.                                                                        |
| `Card`                                                   | Khối nền thẻ. `tone` là `default` / `soft` / `outline`; có `onPress` thì thành nút bấm.                                                                 |
| `ListRow`, `MenuSection`                                 | Dòng menu có icon, chữ phụ, mũi tên; nhóm dòng có tiêu đề và đường kẻ.                                                                                  |
| `Badge`                                                  | Nhãn viên thuốc: trạng thái, % giảm giá, phân loại.                                                                                                     |
| `Chip`                                                   | Lựa chọn dạng viên: tab trạng thái, bộ lọc, khung giờ.                                                                                                  |
| `SegmentedTabs`                                          | Tab chia đoạn trong một màn.                                                                                                                            |
| `BrandButton`, `IconButton`                              | Nút chính (`primary` / `secondary` / `outline`) và nút icon tròn.                                                                                       |
| `TextField`, `PasswordField`, `SelectField`              | Ô nhập.                                                                                                                                                 |
| `EmptyCard`, `ErrorState`, `LoadingState`, `InlineAlert` | Trạng thái rỗng, lỗi, đang tải, cảnh báo trong dòng.                                                                                                    |
| `ConfirmDialog`, `Popover`                               | Hộp xác nhận và menu nổi.                                                                                                                               |
| `TabHeader`                                              | Header của tab và màn con, nền trùng nền trang. `variant="seller"` thêm nhãn "Người bán".                                                               |
| `Divider`                                                | Đường kẻ mảnh.                                                                                                                                          |

## Công thức thường gặp

Màn thường:

```tsx
<Screen header={<BuyerHeader title="Hồ sơ" />} onRefresh={refetch} refreshing={isRefetching}>
  <QueryBoundary errorMessage={toProfileErrorMessage} query={profileQuery}>
    {(profile) => <ProfileCard profile={profile} />}
  </QueryBoundary>
</Screen>
```

Màn danh sách có tải thêm:

```tsx
const query = useInfiniteQuery({ … });
const items = query.data?.pages.flatMap((page) => page.items) ?? [];

<ScreenList
  data={items}
  empty={<QueryListEmpty empty={<EmptyCard … />} errorMessage={…} query={query} />}
  header={<BuyerHeader title="Đơn hàng" />}
  keyExtractor={(item) => item.id}
  listHeader={<Filters />}
  loadingMore={query.isFetchingNextPage}
  onEndReached={() => query.hasNextPage && !query.isFetchingNextPage && query.fetchNextPage()}
  renderItem={(item) => <ItemCard item={item} />}
/>
```

Chữ trên nền màu:

```tsx
<View style={{ backgroundColor: theme.primary }}>
  <AppText tone="onPrimary" weight="bold">
    Đặt ngay
  </AppText>
</View>
```
