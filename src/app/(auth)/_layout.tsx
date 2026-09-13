import { Stack } from 'expo-router';

// Nhóm (auth) dùng Stack riêng nên không có thanh tab — người chưa đăng nhập
// không thấy và không bấm được sang các tab chính.
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
