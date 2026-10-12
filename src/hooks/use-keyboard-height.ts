import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

export type KeyboardState = {
  /** Chiều cao bàn phím; 0 khi đang ẩn. */
  height: number;
  /** Mép trên bàn phím theo toạ độ màn hình; 0 khi đang ẩn hoặc không biết. */
  top: number;
};

// Android chạy edge-to-edge (Expo SDK 54+) nên `adjustResize` không còn co màn hình khi bàn phím hiện:
// bàn phím đè lên nội dung, các màn phải tự chừa chỗ dựa vào chiều cao này.
export function useKeyboard(): KeyboardState {
  const [state, setState] = useState<KeyboardState>({ height: 0, top: 0 });

  useEffect(() => {
    // iOS bắn will* ngay khi bàn phím bắt đầu trượt lên nên chuyển động khớp với bàn phím;
    // Android chỉ có did*.
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const show = Keyboard.addListener(showEvent, (event) =>
      setState({ height: event.endCoordinates.height, top: event.endCoordinates.screenY }),
    );
    const hide = Keyboard.addListener(hideEvent, () => setState({ height: 0, top: 0 }));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return state;
}

export function useKeyboardHeight() {
  return useKeyboard().height;
}
