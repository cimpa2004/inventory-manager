import type { SQLiteDatabase } from 'expo-sqlite';

import { migration as createProducts } from './migrations/001_create_products';

export type Migration = {
  version: number;
  name: string;
  sql: string;
};

export const migrations: Migration[] = [createProducts];

type AppliedMigration = {
  version: number;
};

export async function runMigrations(database: SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const appliedMigrations = await database.getAllAsync<AppliedMigration>(
    'SELECT version FROM schema_migrations ORDER BY version',
  );
  const appliedVersions = new Set(
    appliedMigrations.map((migration) => migration.version),
  );
  const latestAppliedVersion = Math.max(
    0,
    ...appliedMigrations.map((migration) => migration.version),
  );
  const latestKnownVersion = Math.max(
    0,
    ...migrations.map((migration) => migration.version),
  );

  if (latestAppliedVersion > latestKnownVersion) {
    throw new Error(
      `Database version ${latestAppliedVersion} is newer than the app supports (${latestKnownVersion}).`,
    );
  }

  for (const migration of migrations) {
    if (appliedVersions.has(migration.version)) {
      continue;
    }

    await database.withTransactionAsync(async () => {
      await database.execAsync(migration.sql);
      await database.runAsync(
        'INSERT INTO schema_migrations (version, name) VALUES (?, ?)',
        migration.version,
        migration.name,
      );
    });
  }
}
