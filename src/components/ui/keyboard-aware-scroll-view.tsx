import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type ReactNode,
  type Ref,
} from 'react';
import {
  Dimensions,
  ScrollView,
  TextInput,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
} from 'react-native';

import { useKeyboard } from '@/hooks/use-keyboard-height';

// Khoảng hở tối thiểu giữa ô đang nhập và mép trên bàn phím.
const FOCUS_GAP = 24;

const KeyboardScrollContext = createContext<(() => void) | null>(null);

/** Ô nhập gọi hàm này khi được focus để ScrollView cuộn nó lên khỏi bàn phím (nếu đang nằm trong). */
export function useScrollFocusedIntoView() {
  return useContext(KeyboardScrollContext);
}

type KeyboardAwareScrollViewProps = ScrollViewProps & {
  children: ReactNode;
  /** Phần bị che thêm phía trên bàn phím (vd. dải nút nổi ở đáy) cần chừa ra khi cuộn. */
  bottomOffset?: number;
  /** Để màn gọi `scrollTo` (vd. cuộn tới mục đang có lỗi). */
  ref?: Ref<ScrollView | null>;
};

/**
 * ScrollView chừa chỗ cho bàn phím và tự cuộn ô đang nhập lên trên bàn phím. Trên Android chạy
 * edge-to-edge, hệ điều hành không còn co màn hình khi bàn phím hiện nên phải tự làm việc này.
 */
export function KeyboardAwareScrollView({
  children,
  contentContainerStyle,
  bottomOffset = 0,
  onScroll,
  scrollEventThrottle,
  ref,
  ...props
}: KeyboardAwareScrollViewProps) {
  const keyboard = useKeyboard();
  const { height, top } = keyboard;
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  useImperativeHandle<ScrollView | null, ScrollView | null>(ref, () => scrollRef.current, []);

  const scrollFocusedIntoView = useCallback(() => {
    if (!height) return;

    const input = TextInput.State.currentlyFocusedInput();
    if (!input) return;

    // Chờ một khung hình để phần đệm dưới đáy (bằng chiều cao bàn phím) kịp áp dụng.
    requestAnimationFrame(() => {
      input.measureInWindow((_x, y, _width, inputHeight) => {
        const keyboardTop = top > 0 ? top : Dimensions.get('window').height - height;
        const overflow = y + inputHeight - (keyboardTop - FOCUS_GAP - bottomOffset);
        if (overflow > 0) {
          scrollRef.current?.scrollTo({ y: scrollY.current + overflow, animated: true });
        }
      });
    });
  }, [height, top, bottomOffset]);

  // Bàn phím vừa hiện (hoặc đổi chiều cao): đưa ô đang nhập lên.
  useEffect(() => {
    scrollFocusedIntoView();
  }, [scrollFocusedIntoView]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = event.nativeEvent.contentOffset.y;
    onScroll?.(event);
  };

  const contextValue = useMemo(() => scrollFocusedIntoView, [scrollFocusedIntoView]);

  return (
    <KeyboardScrollContext.Provider value={contextValue}>
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        {...props}
        contentContainerStyle={[
          contentContainerStyle,
          // Thêm đúng chiều cao bàn phím để kéo được nội dung cuối lên trên bàn phím.
          keyboard.height ? { paddingBottom: keyboard.height + bottomOffset + FOCUS_GAP } : null,
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={scrollEventThrottle ?? 16}
      >
        {children}
      </ScrollView>
    </KeyboardScrollContext.Provider>
  );
}
