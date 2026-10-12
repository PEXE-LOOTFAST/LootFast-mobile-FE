/** Hai chữ cái cuối của họ tên, dùng làm ảnh đại diện tạm khi người dùng chưa có ảnh. */
export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
