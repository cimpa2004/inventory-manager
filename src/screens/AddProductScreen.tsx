import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

import { createProduct, type CreateProductInput } from '../database';
import { useLocalMutation } from '../data/localQuery';
import { globalStyles } from '../theme';

type AddProductScreenProps = {
  onProductCreated: () => void;
};

type ProductForm = {
  name: string;
  sku: string;
  code: string;
  description: string;
  price: string;
  quantity: string;
};

const initialForm: ProductForm = {
  name: '',
  sku: '',
  code: '',
  description: '',
  price: '',
  quantity: '',
};

export function AddProductScreen({
  onProductCreated,
}: AddProductScreenProps) {
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createProductMutation = useLocalMutation<CreateProductInput, number>(
    createProduct,
    ['products'],
  );

  const updateField = (field: keyof ProductForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveProduct = async () => {
    if (!form.name.trim() || !form.sku.trim() || !form.code.trim()) {
      setErrorMessage('Name, SKU, and code are required.');
      return;
    }

    const price = form.price === '' ? 0 : Number(form.price);
    const quantity = form.quantity === '' ? 0 : Number(form.quantity);
    if (
      !Number.isInteger(price) ||
      price < 0 ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      setErrorMessage('Price and quantity must be whole numbers of 0 or more.');
      return;
    }

    setErrorMessage(null);
    try {
      await createProductMutation.mutateAsync({
        name: form.name.trim(),
        sku: form.sku.trim(),
        code: form.code.trim(),
        description: form.description.trim() || undefined,
        priceCents: price,
        quantity,
      });
      setForm(initialForm);
      onProductCreated();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to save product.',
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={globalStyles.screen}
    >
      <ScrollView
        contentContainerStyle={globalStyles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="headlineSmall">Add product</Text>
        <Text variant="bodyMedium" style={[globalStyles.mutedText, styles.intro]}>
          Create an item with a code that can be scanned later.
        </Text>

        <TextInput
          label="Product name"
          value={form.name}
          onChangeText={(value) => updateField('name', value)}
          mode="outlined"
          style={globalStyles.field}
        />
        <TextInput
          label="SKU"
          value={form.sku}
          onChangeText={(value) => updateField('sku', value)}
          mode="outlined"
          style={globalStyles.field}
        />
        <TextInput
          label="Code"
          value={form.code}
          onChangeText={(value) => updateField('code', value)}
          mode="outlined"
          style={globalStyles.field}
        />
        <TextInput
          label="Description"
          value={form.description}
          onChangeText={(value) => updateField('description', value)}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={globalStyles.field}
        />
        <TextInput
          label="Price (cents)"
          value={form.price}
          onChangeText={(value) => updateField('price', value)}
          keyboardType="number-pad"
          mode="outlined"
          style={globalStyles.field}
        />
        <TextInput
          label="Quantity"
          value={form.quantity}
          onChangeText={(value) => updateField('quantity', value)}
          keyboardType="number-pad"
          mode="outlined"
          style={globalStyles.field}
        />

        {errorMessage ? (
          <HelperText type="error" visible>
            {errorMessage}
          </HelperText>
        ) : null}
        <Button
          mode="contained"
          onPress={saveProduct}
          loading={createProductMutation.isPending}
          disabled={createProductMutation.isPending}
          style={globalStyles.primaryButton}
        >
          Save product
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginTop: 4,
  },
});
