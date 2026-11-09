export { DATABASE_NAME, getDatabase } from './client';
export { runMigrations } from './migrations';
export {
  createProduct,
  getProductByCode,
  listProducts,
  type CreateProductInput,
  type Product,
} from './products';
