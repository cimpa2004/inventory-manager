import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { listProducts, type Product } from '../database';
import { ProductCard } from '../components/ProductCard';
import { useLocalQuery } from '../data/localQuery';
import { globalStyles } from '../theme';

type ProductListScreenProps = {
  onAddProduct: () => void;
};

export function ProductListScreen({
  onAddProduct,
}: ProductListScreenProps) {
  const {
    data: products = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useLocalQuery<Product[]>('products', listProducts);

  return (
    <View style={globalStyles.screen}>
      <FlatList
        contentContainerStyle={[
          globalStyles.content,
          products.length === 0 && styles.emptyList,
        ]}
        data={products}
        keyExtractor={(product) => product.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => {
              void refetch();
            }}
          />
        }
        renderItem={({ item }) => <ProductCard product={item} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="headlineSmall">Products</Text>
            <Text variant="bodyMedium" style={globalStyles.mutedText}>
              {products.length} {products.length === 1 ? 'item' : 'items'} in
              your inventory
            </Text>
            <Button
              mode="contained"
              icon="plus"
              onPress={onAddProduct}
              style={styles.addButton}
            >
              Add product
            </Button>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Text variant="titleMedium">No products yet</Text>
              <Text variant="bodyMedium" style={globalStyles.mutedText}>
                Add your first product to start managing inventory.
              </Text>
            </View>
          ) : undefined
        }
        ListFooterComponent={
          error ? (
            <Text variant="bodyMedium" style={styles.error}>
              {error.message}
            </Text>
          ) : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
  },
  addButton: {
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 28,
  },
  error: {
    color: '#B91C1C',
    marginTop: 8,
  },
});
