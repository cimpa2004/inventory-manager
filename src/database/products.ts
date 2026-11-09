import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from './client';

export type Product = {
  id: number;
  name: string;
  sku: string;
  code: string;
  description: string | null;
  price_cents: number;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export type CreateProductInput = {
  name: string;
  sku: string;
  code: string;
  description?: string;
  priceCents?: number;
  quantity?: number;
};

export type RemoveProductStockInput = {
  id: number;
  quantity: number;
};

export async function createProduct(
  input: CreateProductInput,
  database?: SQLiteDatabase,
): Promise<number> {
  const db = database ?? (await getDatabase());
  const result = await db.runAsync(
    `INSERT INTO products
      (name, sku, code, description, price_cents, quantity)
     VALUES (?, ?, ?, ?, ?, ?)`,
    input.name,
    input.sku,
    input.code,
    input.description ?? null,
    input.priceCents ?? 0,
    input.quantity ?? 0,
  );

  return result.lastInsertRowId;
}

export async function getProductByCode(
  code: string,
  database?: SQLiteDatabase,
): Promise<Product | null> {
  const db = database ?? (await getDatabase());
  return db.getFirstAsync<Product>(
    'SELECT * FROM products WHERE code = ? LIMIT 1',
    code,
  );
}

export async function removeProductStock(
  input: RemoveProductStockInput,
  database?: SQLiteDatabase,
): Promise<void> {
  const db = database ?? (await getDatabase());
  const result = await db.runAsync(
    `UPDATE products
     SET quantity = quantity - ?, updated_at = datetime('now')
     WHERE id = ? AND quantity >= ?`,
    input.quantity,
    input.id,
    input.quantity,
  );

  if (result.changes === 0) {
    throw new Error('Unable to remove stock. The available quantity changed.');
  }
}

export async function listProducts(
  database?: SQLiteDatabase,
): Promise<Product[]> {
  const db = database ?? (await getDatabase());
  return db.getAllAsync<Product>('SELECT * FROM products ORDER BY name');
}
