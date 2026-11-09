import type { Migration } from '../migrations';

export const migration: Migration = {
  version: 1,
  name: 'create_products',
  sql: `
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name TEXT NOT NULL,
      sku TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL UNIQUE,
      description TEXT,
      price_cents INTEGER NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
      quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX products_name_idx ON products (name);
    CREATE INDEX products_code_idx ON products (code);
  `,
};
