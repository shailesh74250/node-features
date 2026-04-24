import { InferSelectModel, sql } from 'drizzle-orm';
import { boolean, doublePrecision, pgTable, text } from 'drizzle-orm/pg-core';

export const productsTable = pgTable('products_catalog', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  brand: text('brand').notNull(),
  tags: text('tags').array().notNull().default(sql`'{}'::text[]`),
  price: doublePrecision('price').notNull(),
  inStock: boolean('in_stock').notNull(),
});

export type ProductRow = InferSelectModel<typeof productsTable>;