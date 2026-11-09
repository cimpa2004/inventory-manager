import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

import type { Product } from '../database';
import { appTheme } from '../theme';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card mode="contained" style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium">{product.name}</Text>
          <Text variant="titleMedium" style={styles.quantity}>
            {product.quantity}
          </Text>
        </View>
        <Text variant="bodyMedium" style={styles.code}>
          {product.code}
        </Text>
        {product.description ? (
          <Text variant="bodyMedium" style={styles.description}>
            {product.description}
          </Text>
        ) : null}
        <Text variant="labelMedium" style={styles.sku}>
          SKU {product.sku}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: appTheme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantity: {
    color: appTheme.colors.primary,
  },
  code: {
    marginTop: 6,
    color: appTheme.colors.primary,
  },
  description: {
    marginTop: 8,
    color: appTheme.colors.secondary,
  },
  sku: {
    marginTop: 12,
    color: appTheme.colors.secondary,
  },
});
