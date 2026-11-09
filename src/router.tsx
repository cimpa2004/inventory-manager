import { useCallback, useState } from 'react';
import { BottomNavigation } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddProductScreen } from './screens/AddProductScreen';
import { CameraPlaceholderScreen } from './screens/CameraPlaceholderScreen';
import { ProductListScreen } from './screens/ProductListScreen';

export function InventoryRouter() {
  const [index, setIndex] = useState(0);

  const routes = [
    { key: 'products', title: 'Products', focusedIcon: 'package-variant' },
    { key: 'add', title: 'Add', focusedIcon: 'plus-circle-outline' },
    { key: 'camera', title: 'Camera', focusedIcon: 'camera-outline' },
  ];

  const renderScene = useCallback(
    ({ route }: { route: { key: string } }) => {
      switch (route.key) {
        case 'products':
          return (
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
              <ProductListScreen onAddProduct={() => setIndex(1)} />
            </SafeAreaView>
          );
        case 'add':
          return (
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
              <AddProductScreen onProductCreated={() => setIndex(0)} />
            </SafeAreaView>
          );
        case 'camera':
          return (
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
              <CameraPlaceholderScreen />
            </SafeAreaView>
          );
      }
    },
    [],
  );

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
}
