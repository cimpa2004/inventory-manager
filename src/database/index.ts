export { DATABASE_NAME, getDatabase } from './client';
export { runMigrations } from './migrations';
export {
  createProduct,
  getProductByCode,
  listProducts,
  removeProductStock,
  type CreateProductInput,
  type RemoveProductStockInput,
  type Product,
} from './products';
