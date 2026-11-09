import * as SQLite from 'expo-sqlite';

import { runMigrations } from './migrations';

export const DATABASE_NAME = 'inventory.db';

let databasePromise: Promise<SQLite.SQLiteDatabase> | undefined;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  databasePromise ??= initializeDatabase();
  return databasePromise;
}

async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  const database = await SQLite.openDatabaseAsync(DATABASE_NAME);
  try {
    await runMigrations(database);
    return database;
  } catch (error) {
    await database.closeAsync();
    throw error;
  }
}
