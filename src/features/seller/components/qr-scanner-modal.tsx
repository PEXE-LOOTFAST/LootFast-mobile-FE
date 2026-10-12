import { CameraView, scanFromURLAsync, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { BrandButton } from '@/components/ui/brand-button';
import { HomeIcons } from '@/features/home/constants/icons';
import { SellerIcons } from '@/features/seller/constants/icons';

const QR_PREFIX = 'lootfast://pickup/';
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
      Alert.alert('Không tìm thấy mã QR', 'Ảnh này không chứa mã QR hợp lệ. Chọn ảnh khác.');
      return;
    }

    const code = extractPickupCode(barcodes[0]!.data);
    if (!code) {
      Alert.alert('Mã QR không hợp lệ', 'Mã QR này không phải mã lấy hàng của LootFast.');
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
      <View style={[styles.screen, { backgroundColor: '#000' }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable
            accessibilityLabel="Đóng"
            accessibilityRole="button"
            hitSlop={8}
            onPress={handleClose}
            style={styles.headerButton}
          >
            <Icon name={HomeIcons.close} color="#FFF" size={24} />
          </Pressable>
          <Text style={styles.title}>Quét mã QR lấy hàng</Text>
          <Pressable
            accessibilityLabel="Chọn ảnh QR từ thư viện"
            accessibilityRole="button"
            hitSlop={8}
            onPress={handlePickImage}
            style={styles.headerButton}
          >
            <Icon name={SellerIcons.photoLibrary} color="#FFF" size={24} />
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
const CORNER_COLOR = '#FFFFFF';
const OVERLAY_COLOR = 'rgba(0,0,0,0.55)';

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
    zIndex: 10,
  },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#FFF', fontSize: 17, fontWeight: '800' },
  permissionContainer: { flex: 1, justifyContent: 'center', gap: 20, paddingHorizontal: 32 },
  permissionText: { color: '#FFF', fontSize: 15, lineHeight: 22, textAlign: 'center' },
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
  hint: { color: '#FFF', fontSize: 14, textAlign: 'center' as const, paddingHorizontal: 32 },
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
