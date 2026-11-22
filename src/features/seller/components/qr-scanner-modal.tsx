import { CameraView, scanFromURLAsync, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FontSize, FontWeight, Radius, Spacing, StaticColors } from '@/constants/theme';
import { Icon } from '@/components/ui/icon';
import { BrandButton } from '@/components/ui/brand-button';
import { HomeIcons } from '@/features/home/constants/icons';
import { SellerIcons } from '@/features/seller/constants/icons';

const QR_PREFIX = 'lootfast://pickup/';
const FEEDBACK_MS = 2500;
const NOT_LOOTFAST = 'Mã này không phải mã nhận món của LootFast. Nhờ khách mở lại đơn trong app.';
const CODE_PREFIX = 'LF-';

function extractPickupCode(data: string): string | undefined {
  if (!data.startsWith(QR_PREFIX)) return undefined;
  const credential = data.slice(QR_PREFIX.length);
  if (!credential.startsWith(CODE_PREFIX)) return undefined;
  return credential.slice(CODE_PREFIX.length);
}

type QrScannerModalProps = {
  visible: boolean;
  onClose: () => void;
  onScan: (pickupCode: string) => void;
};

export function QrScannerModal({ visible, onClose, onScan }: QrScannerModalProps) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  // Báo ngay trên khung camera khi quét trúng mã lạ, thay vì im lặng như thể camera không chạy.
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), FEEDBACK_MS);

    return () => clearTimeout(timer);
  }, [feedback]);

  const handleResult = useCallback(
    (code: string) => {
      setScanned(true);
      onScan(code);
      onClose();
    },
    [onScan, onClose],
  );

  const handleBarCodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (scanned) return;
      const code = extractPickupCode(data);
      if (code) handleResult(code);
      else setFeedback(NOT_LOOTFAST);
    },
    [scanned, handleResult],
  );

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    const asset = result.assets?.[0];
    if (result.canceled || !asset) return;

    const barcodes = await scanFromURLAsync(asset.uri, ['qr']);
    if (barcodes.length === 0) {
      setFeedback('Không thấy mã QR trong ảnh này. Chọn ảnh khác hoặc quét trực tiếp.');
      return;
    }

    const code = extractPickupCode(barcodes[0]!.data);
    if (!code) {
      setFeedback(NOT_LOOTFAST);
      return;
    }

    handleResult(code);
  };

  const handleClose = () => {
    setScanned(false);
    onClose();
  };

  const needsPermission = permission && !permission.granted;

  return (
    <Modal
      animationType="slide"
      navigationBarTranslucent
      onRequestClose={handleClose}
      statusBarTranslucent
      visible={visible}
    >
      <View style={[styles.screen, { backgroundColor: StaticColors.black }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable
            accessibilityLabel="Đóng"
            accessibilityRole="button"
            hitSlop={8}
            onPress={handleClose}
            style={styles.headerButton}
          >
            <Icon name={HomeIcons.close} color={StaticColors.white} size={24} />
          </Pressable>
          <Text style={styles.title}>Quét mã QR lấy hàng</Text>
          <Pressable
            accessibilityLabel="Chọn ảnh QR từ thư viện"
            accessibilityRole="button"
            hitSlop={8}
            onPress={handlePickImage}
            style={styles.headerButton}
          >
            <Icon name={SellerIcons.photoLibrary} color={StaticColors.white} size={24} />
          </Pressable>
        </View>

        {needsPermission ? (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>
              Cho phép LootFast dùng camera để quét mã QR xác nhận khách đã nhận món.
            </Text>
            <BrandButton onPress={() => void requestPermission()}>Cho phép camera</BrandButton>
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            <CameraView
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.overlay}>
              <View style={styles.overlayTop} />
              <View style={styles.overlayMiddle}>
                <View style={styles.overlaySide} />
                <View style={styles.scanArea}>
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                </View>
                <View style={styles.overlaySide} />
              </View>
              <View style={styles.overlayBottom}>
                <Text style={styles.hint}>Đưa camera vào mã QR trên màn hình khách hàng</Text>
                {feedback ? (
                  <View accessibilityLiveRegion="polite" style={styles.feedback}>
                    <Text style={styles.feedbackText}>{feedback}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const SCAN_SIZE = 260;
const CORNER_SIZE = 28;
const CORNER_WIDTH = 4;
const CORNER_COLOR = StaticColors.white;
const OVERLAY_COLOR = StaticColors.cameraScrim;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    zIndex: 10,
  },
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { color: StaticColors.white, fontSize: FontSize.title, fontWeight: FontWeight.bold },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingHorizontal: Spacing.xxxl,
  },
  permissionText: {
    color: StaticColors.white,
    fontSize: FontSize.bodyLg,
    lineHeight: 22,
    textAlign: 'center',
  },
  cameraContainer: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFill, justifyContent: 'center' } as const,
  overlayTop: { flex: 1, backgroundColor: OVERLAY_COLOR },
  overlayMiddle: { flexDirection: 'row' as const, height: SCAN_SIZE },
  overlaySide: { flex: 1, backgroundColor: OVERLAY_COLOR },
  scanArea: { width: SCAN_SIZE, height: SCAN_SIZE },
  overlayBottom: {
    flex: 1,
    backgroundColor: OVERLAY_COLOR,
    alignItems: 'center' as const,
    paddingTop: 28,
  },
  hint: {
    color: StaticColors.white,
    fontSize: FontSize.body,
    textAlign: 'center' as const,
    paddingHorizontal: Spacing.xxxl,
  },
  feedback: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: StaticColors.white,
  },
  feedbackText: {
    color: StaticColors.black,
    fontSize: FontSize.bodySm,
    fontWeight: FontWeight.bold,
    textAlign: 'center' as const,
  },
  corner: { position: 'absolute' as const, width: CORNER_SIZE, height: CORNER_SIZE },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: CORNER_COLOR,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: CORNER_COLOR,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: CORNER_COLOR,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: CORNER_COLOR,
  },
});
