import * as ImagePicker from 'expo-image-picker';
import { router, type Href } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';

import { getSessionState } from '@/lib/auth-session';
import { draftStorage } from '@/lib/storage';

type ImageSource = 'camera' | 'library';

/**
 * Android có thể tắt hẳn app trong lúc camera/thư viện đang mở (thiếu RAM), lúc quay lại app khởi
 * động lại ở trang chủ và mất nội dung đang nhập. `route` là màn người dùng đang đứng để quay lại,
 * `draft` là nội dung cần khôi phục cùng ảnh vừa chọn.
 */
export type PickResume<TDraft = unknown> = {
  route: string;
  draft?: TDraft;
};

type PickImagesOptions = {
  /** Cắt ảnh sau khi chọn/chụp; không dùng được cùng lúc với chọn nhiều ảnh. */
  allowsEditing?: boolean;
  aspect?: [number, number];
  /** Số ảnh tối đa chọn được từ thư viện; chụp ảnh luôn chỉ ra một ảnh. */
  selectionLimit?: number;
  resume?: PickResume;
};

type RecoveredPick<TDraft> = {
  assets: ImagePicker.ImagePickerAsset[];
  draft?: TDraft;
};

const IMAGE_QUALITY = 0.8;
const PENDING_KEY = 'pending_image_pick';

async function markPendingPick(resume: PickResume) {
  try {
    await draftStorage.set(PENDING_KEY, JSON.stringify(resume));
  } catch {
    // Không lưu được thì chỉ mất khả năng khôi phục, không được chặn việc chọn ảnh.
  }
}

async function clearPendingPick() {
  try {
    await draftStorage.clear(PENDING_KEY);
  } catch {
    // Bỏ qua: lần chọn ảnh sau sẽ ghi đè dấu cũ.
  }
}

async function readPendingPick(): Promise<PickResume | null> {
  try {
    const raw = await draftStorage.get(PENDING_KEY);

    return raw ? (JSON.parse(raw) as PickResume) : null;
  } catch {
    return null;
  }
}

function askImageSource(): Promise<ImageSource | null> {
  return new Promise((resolve) => {
    Alert.alert(
      'Thêm ảnh',
      'Bạn muốn chụp ảnh mới hay chọn từ thư viện?',
      [
        { text: 'Chụp ảnh', onPress: () => resolve('camera') },
        { text: 'Chọn từ thư viện', onPress: () => resolve('library') },
        { text: 'Huỷ', style: 'cancel', onPress: () => resolve(null) },
      ],
      { cancelable: true, onDismiss: () => resolve(null) },
    );
  });
}

function alertPermissionDenied(source: ImageSource) {
  Alert.alert(
    'Cần quyền truy cập',
    source === 'camera'
      ? 'Vui lòng cấp quyền camera trong Cài đặt hệ thống để chụp ảnh.'
      : 'Vui lòng cấp quyền truy cập thư viện ảnh trong Cài đặt hệ thống.',
  );
}

/**
 * Cho người dùng chụp ảnh mới hoặc chọn từ thư viện (trên web chỉ có thư viện). Trả mảng rỗng khi
 * họ huỷ hoặc từ chối cấp quyền.
 */
export async function pickImages({
  allowsEditing,
  aspect,
  selectionLimit = 1,
  resume,
}: PickImagesOptions = {}): Promise<ImagePicker.ImagePickerAsset[]> {
  const source = Platform.OS === 'web' ? 'library' : await askImageSource();
  if (!source) return [];

  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    alertPermissionDenied(source);
    return [];
  }

  // Dấu này chỉ còn lại nếu app bị tắt giữa chừng; quay lại bình thường thì xoá ngay bên dưới.
  if (resume && Platform.OS === 'android') await markPendingPick(resume);

  try {
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing,
            aspect,
            quality: IMAGE_QUALITY,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: selectionLimit > 1 ? undefined : allowsEditing,
            aspect,
            quality: IMAGE_QUALITY,
            allowsMultipleSelection: selectionLimit > 1,
            selectionLimit: selectionLimit > 1 ? selectionLimit : undefined,
          });

    return result.canceled ? [] : result.assets;
  } finally {
    await clearPendingPick();
  }
}

/** Gọi sau khi khôi phục phiên: nếu lần chọn ảnh trước bị gián đoạn thì đưa người dùng về đúng màn. */
export async function resumeInterruptedPick() {
  const pending = await readPendingPick();
  if (!pending) return;

  // Màn người bán và hồ sơ cần đăng nhập; không khôi phục được phiên thì bỏ dấu, ở lại trang chủ.
  if (getSessionState().status !== 'authenticated') {
    await clearPendingPick();
    return;
  }

  router.replace(pending.route as Href);
}

/**
 * Đặt ở màn có chọn ảnh. Nếu lần chọn trước bị gián đoạn ở đúng màn này (`route` khớp) thì trả lại
 * ảnh vừa chọn kèm nội dung đã lưu để màn khôi phục form.
 */
export function useRecoveredPick<TDraft>(
  route: string,
  onRecovered: (recovered: RecoveredPick<TDraft>) => void,
) {
  const callback = useRef(onRecovered);

  useEffect(() => {
    callback.current = onRecovered;
  });

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    void (async () => {
      const pending = await readPendingPick();
      if (!pending || pending.route !== route) return;

      await clearPendingPick();
      const result = await ImagePicker.getPendingResultAsync();
      const assets = result && 'assets' in result && !result.canceled ? result.assets : [];

      callback.current({ assets, draft: pending.draft as TDraft | undefined });
    })();
  }, [route]);
}
