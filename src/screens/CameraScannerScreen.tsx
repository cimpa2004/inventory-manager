import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  CameraView,
  type BarcodeScanningResult,
  type BarcodeType,
  useCameraPermissions,
} from 'expo-camera';
import {
  Button,
  Card,
  HelperText,
  Text,
  TextInput,
} from 'react-native-paper';

import {
  getProductByCode,
  removeProductStock,
  type Product,
} from '../database';
import { useLocalMutation } from '../data/localQuery';
import { globalStyles } from '../theme';

const barcodeTypes: BarcodeType[] = [
  'qr',
  'code128',
  'code39',
  'code93',
  'ean13',
  'ean8',
  'upc_a',
  'upc_e',
  'itf14',
  'codabar',
  'datamatrix',
  'pdf417',
  'aztec',
];

export function CameraScannerScreen({
  onAddProduct,
}: {
  onAddProduct: (code: string) => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [stockToRemove, setStockToRemove] = useState('1');
  const removeStockMutation = useLocalMutation(removeProductStock, [
    'products',
  ]);

  const handleScan = useCallback(
    async ({ data }: BarcodeScanningResult) => {
      if (scannedCode || !data.trim()) {
        return;
      }

      const code = data.trim();
      setScannedCode(code);
      setScanError(null);
      setIsLookingUp(true);
      try {
        setProduct(await getProductByCode(code));
      } catch (error: unknown) {
        setScanError(
          error instanceof Error ? error.message : 'Unable to find this code.',
        );
      } finally {
        setIsLookingUp(false);
      }
    },
    [scannedCode],
  );

  const resetScan = () => {
    setScannedCode(null);
    setProduct(null);
    setScanError(null);
    setStockToRemove('1');
  };

  const removeStock = async () => {
    if (!product) {
      return;
    }

    const quantity = Number(stockToRemove);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setScanError('Enter a whole number greater than 0.');
      return;
    }
    if (quantity > product.quantity) {
      setScanError(
        `Only ${product.quantity} ${product.quantity === 1 ? 'unit is' : 'units are'} available.`,
      );
      return;
    }

    try {
      await removeStockMutation.mutateAsync({ id: product.id, quantity });
      resetScan();
    } catch (error: unknown) {
      setScanError(
        error instanceof Error ? error.message : 'Unable to remove stock.',
      );
    }
  };

  if (!permission) {
    return <View style={globalStyles.screen} />;
  }

  if (!permission.granted) {
    return (
      <View style={[globalStyles.screen, styles.centered]}>
        <Text variant="headlineSmall">Camera access needed</Text>
        <Text variant="bodyMedium" style={globalStyles.mutedText}>
          Allow camera access to scan inventory QR codes and barcodes.
        </Text>
        <Button mode="contained" onPress={requestPermission} style={styles.button}>
          Allow camera
        </Button>
      </View>
    );
  }

  return (
    <View style={globalStyles.screen}>
      <View style={styles.controls}>
        <Text variant="headlineSmall">Scan inventory code</Text>
        <Text variant="bodyMedium" style={globalStyles.mutedText}>
          Point your camera at a QR code or barcode.
        </Text>
      </View>
      <View style={styles.cameraFrame}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes,
          }}
          onBarcodeScanned={scannedCode ? undefined : handleScan}
        />
        <View pointerEvents="none" style={styles.scanGuide} />
      </View>
      <View style={styles.result}>
        {isLookingUp ? <Text>Looking up scanned code...</Text> : null}
        {scannedCode ? (
          <Card mode="contained">
            <Card.Content>
              <Text variant="labelLarge">Scanned code</Text>
              <Text variant="titleMedium" style={styles.code}>
                {scannedCode}
              </Text>
              {product ? (
                <>
                  <Text variant="bodyMedium">
                    Found: {product.name} ({product.quantity} in stock)
                  </Text>
                  <TextInput
                    label="Quantity to remove"
                    value={stockToRemove}
                    onChangeText={setStockToRemove}
                    keyboardType="number-pad"
                    mode="outlined"
                    style={globalStyles.field}
                  />
                  <Button
                    mode="outlined"
                    icon="minus-circle-outline"
                    onPress={removeStock}
                    loading={removeStockMutation.isPending}
                    disabled={removeStockMutation.isPending}
                    style={styles.button}
                  >
                    Remove stock
                  </Button>
                </>
              ) : (
                <>
                  <Text variant="bodyMedium" style={globalStyles.mutedText}>
                    This code is not in your inventory yet.
                  </Text>
                  <Button
                    mode="contained"
                    icon="plus"
                    onPress={() => onAddProduct(scannedCode)}
                    style={styles.button}
                  >
                    Add product
                  </Button>
                </>
              )}
              <Button mode="text" onPress={resetScan}>
                Scan another
              </Button>
            </Card.Content>
          </Card>
        ) : null}
        {scanError ? <HelperText type="error">{scanError}</HelperText> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    gap: 14,
    padding: 20,
  },
  cameraFrame: {
    height: 280,
    marginHorizontal: 20,
    overflow: 'hidden',
    borderRadius: 16,
  },
  scanGuide: {
    position: 'absolute',
    top: '20%',
    right: '12%',
    bottom: '20%',
    left: '12%',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 12,
  },
  result: {
    padding: 20,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 20,
  },
  code: {
    marginVertical: 8,
  },
  button: {
    marginTop: 16,
  },
});
