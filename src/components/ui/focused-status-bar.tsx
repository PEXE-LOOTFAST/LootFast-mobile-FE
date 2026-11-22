import { useIsFocused } from 'expo-router';
import { StatusBar, type StatusBarStyle } from 'expo-status-bar';

/**
 * Đổi màu chữ/icon status bar chỉ trong lúc màn này đang hiện, cho màn có ảnh hay dải màu đậm
 * tràn lên dưới status bar. Các tab vẫn mounted khi chuyển tab nên phải gỡ theo focus; gỡ xong
 * thì status bar ở `RootLayout` (theo theme của app) tự áp dụng lại.
 */
export function FocusedStatusBar({ style }: { style: StatusBarStyle }) {
  return useIsFocused() ? <StatusBar style={style} /> : null;
}
