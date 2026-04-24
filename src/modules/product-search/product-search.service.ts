import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { asc, eq, sql } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { productsTable, ProductRow } from './product-search.schema';
import { sampleProducts } from './sample-products';
import {
  PendingSyncAction,
  ProductDeleteResponse,
  ProductDocument,
  ProductUpsertResponse,
  ProductSearchResultsResponse,
  ProductSuggestionsResponse,
  ProductWriteRequest,
} from './product-search.types';

@Injectable()
export class ProductSearchService implements OnModuleInit {
  private readonly logger = new Logger(ProductSearchService.name);
  private readonly indexName = process.env.ES_PRODUCTS_INDEX ?? 'products';
  private readonly client: Client;
  private readonly pendingSyncById = new Map<string, PendingSyncAction>();
  private isElasticsearchAvailable = false;

  constructor(private readonly databaseService: DatabaseService) {
    const esNode = process.env.ES_NODE ?? 'http://localhost:9200';
    const username = process.env.ES_USERNAME;
    const password = process.env.ES_PASSWORD;

    this.client = new Client({
      node: esNode,
      auth: username && password ? { username, password } : undefined,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.initializeDatabase();
    await this.initializeElasticsearch();
  }

  async getSuggestions(
    query: string,
    suggestionSize: number,
  ): Promise<ProductSuggestionsResponse> {
    await this.syncPendingOperationsIfPossible();

    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return {
        query,
        suggestions: [],
        source: this.isElasticsearchAvailable ? 'elasticsearch' : 'fallback',
      };
    }

    if (!this.isElasticsearchAvailable) {
      return this.suggestionsFromFallback(
        normalizedQuery,
        suggestionSize,
        await this.listProducts(),
      );
    }

    try {
      const suggestResponse = await this.client.search<ProductDocument>({
        index: this.indexName,
        size: 0,
        suggest: {
          product_suggestions: {
            prefix: normalizedQuery,
            completion: {
              field: 'suggest',
              size: suggestionSize,
              skip_duplicates: true,
            },
          },
        },
      });

      const suggestOptions = suggestResponse.suggest?.product_suggestions?.[0]
        ?.options as Array<{ text?: string }> | undefined;
      const suggestionTexts = Array.isArray(suggestOptions)
        ? suggestOptions
            .map((option) => option.text)
            .filter((text): text is string => typeof text === 'string')
        : [];
      const suggestions = Array.from(new Set(suggestionTexts));

      return {
        query: normalizedQuery,
        suggestions,
        source: 'elasticsearch',
      };
    } catch (error) {
      this.logger.warn(
        `Elasticsearch suggestions query failed. Falling back to database suggestions. ${(error as Error).message}`,
      );
      return this.suggestionsFromFallback(
        normalizedQuery,
        suggestionSize,
        await this.listProducts(),
      );
    }
  }

  async searchProducts(
    query: string,
    resultSize: number,
  ): Promise<ProductSearchResultsResponse> {
    await this.syncPendingOperationsIfPossible();

    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return {
        query,
        total: 0,
        results: [],
        source: this.isElasticsearchAvailable ? 'elasticsearch' : 'fallback',
      };
    }

    if (!this.isElasticsearchAvailable) {
      return this.searchResultsFromFallback(
        normalizedQuery,
        resultSize,
        await this.listProducts(),
      );
    }

    try {
      const searchResponse = await this.client.search<ProductDocument>({
        index: this.indexName,
        size: resultSize,
        query: {
          multi_match: {
            query: normalizedQuery,
            fields: ['name^4', 'brand^3', 'category^2', 'description', 'tags'],
            fuzziness: 'AUTO',
          },
        },
      });

      const results = searchResponse.hits.hits
        .map((hit) => hit._source)
        .filter((product): product is ProductDocument => Boolean(product));

      const totalRaw = searchResponse.hits.total;
      const total = typeof totalRaw === 'number' ? totalRaw : (totalRaw?.value ?? 0);

      return {
        query: normalizedQuery,
        total,
        results,
        source: 'elasticsearch',
      };
    } catch (error) {
      this.logger.warn(
        `Elasticsearch search query failed. Falling back to database results. ${(error as Error).message}`,
      );
      return this.searchResultsFromFallback(
        normalizedQuery,
        resultSize,
        await this.listProducts(),
      );
    }
  }

  async upsertProduct(
    input: ProductWriteRequest,
  ): Promise<ProductUpsertResponse> {
    const product = this.buildProductDocument(input);
    await this.upsertProductInDatabase(product);
    this.pendingSyncById.set(product.id, { operation: 'index', product });

    if (!this.isElasticsearchAvailable) {
      return {
        product,
        syncStatus: 'queued',
        message:
          'Elasticsearch is currently unavailable. Product was saved in PostgreSQL and queued for sync.',
      };
    }

    try {
      await this.indexProduct(product, 'wait_for');
      this.pendingSyncById.delete(product.id);

      return {
        product,
        syncStatus: 'indexed',
        message: 'Product was indexed in Elasticsearch and is now searchable.',
      };
    } catch (error) {
      this.isElasticsearchAvailable = false;
      this.pendingSyncById.set(product.id, { operation: 'index', product });

      this.logger.warn(
        `Indexing product ${product.id} failed. Product queued for retry. ${(error as Error).message}`,
      );

      return {
        product,
        syncStatus: 'queued',
        message:
          'Product saved in PostgreSQL, but Elasticsearch indexing failed. Product has been queued for retry.',
      };
    }
  }

  async listProducts(): Promise<ProductDocument[]> {
    const rows = await this.databaseService.db
      .select()
      .from(productsTable)
      .orderBy(asc(productsTable.id));

    return rows.map((row) => this.mapDbRowToProduct(row));
  }

  async getProductById(id: string): Promise<ProductDocument | undefined> {
    const normalizedId = id.trim();
    const rows = await this.databaseService.db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, normalizedId))
      .limit(1);

    if (rows.length === 0) {
      return undefined;
    }

    return this.mapDbRowToProduct(rows[0]);
  }

  async hasProduct(id: string): Promise<boolean> {
    return Boolean(await this.getProductById(id));
  }

  async deleteProduct(id: string): Promise<ProductDeleteResponse> {
    const normalizedId = id.trim();
    const deleted = await this.removeFromDatabase(normalizedId);
    this.pendingSyncById.set(normalizedId, {
      operation: 'delete',
      id: normalizedId,
    });

    if (!this.isElasticsearchAvailable) {
      return {
        id: normalizedId,
        deleted,
        syncStatus: 'queued',
        message:
          'Product deletion was accepted and queued. Elasticsearch is currently unavailable.',
      };
    }

    try {
      await this.deleteFromIndex(normalizedId, 'wait_for');
      this.pendingSyncById.delete(normalizedId);

      return {
        id: normalizedId,
        deleted,
        syncStatus: 'indexed',
        message: 'Product deletion synced to Elasticsearch.',
      };
    } catch (error) {
      this.isElasticsearchAvailable = false;
      this.logger.warn(
        `Deleting product ${normalizedId} from Elasticsearch failed. Deletion queued for retry. ${(error as Error).message}`,
      );

      return {
        id: normalizedId,
        deleted,
        syncStatus: 'queued',
        message: 'Product deletion queued for retry because Elasticsearch delete failed.',
      };
    }
  }

  private async initializeDatabase(): Promise<void> {
    await this.databaseService.pool.query(`
      CREATE TABLE IF NOT EXISTS products_catalog (
        id text PRIMARY KEY,
        name text NOT NULL,
        description text NOT NULL,
        category text NOT NULL,
        brand text NOT NULL,
        tags text[] NOT NULL DEFAULT '{}',
        price double precision NOT NULL,
        in_stock boolean NOT NULL
      )
    `);

    const [{ count }] = await this.databaseService.db
      .select({ count: sql<number>`count(*)::int` })
      .from(productsTable);

    if (count > 0) {
      return;
    }

    for (const product of sampleProducts) {
      await this.upsertProductInDatabase(product);
    }

    this.logger.log(`Seeded PostgreSQL products catalog with ${sampleProducts.length} products.`);
  }

  private async initializeElasticsearch(): Promise<void> {
    try {
      await this.client.ping();
      await this.ensureIndex();
      await this.seedProductsIfNeeded();
      this.isElasticsearchAvailable = true;
      await this.syncPendingOperationsIfPossible();
      this.logger.log(
        `Connected to Elasticsearch. Product search index: ${this.indexName}`,
      );
    } catch (error) {
      this.isElasticsearchAvailable = false;
      this.logger.warn(
        `Elasticsearch unavailable, using in-memory fallback. ${(error as Error).message}`,
      );
    }
  }

  private async ensureIndex(): Promise<void> {
    const indexExists = await this.client.indices.exists({
      index: this.indexName,
    });
    if (indexExists) {
      return;
    }

    await this.client.indices.create({
      index: this.indexName,
      mappings: {
        properties: {
          id: { type: 'keyword' },
          name: { type: 'text' },
          description: { type: 'text' },
          category: { type: 'text' },
          brand: { type: 'text' },
          tags: { type: 'text' },
          price: { type: 'float' },
          inStock: { type: 'boolean' },
          suggest: { type: 'completion' },
        },
      },
    });
  }

  private async seedProductsIfNeeded(): Promise<void> {
    const countResponse = await this.client.count({ index: this.indexName });
    if (countResponse.count > 0) {
      return;
    }

    const products = await this.listProducts();
    if (products.length === 0) {
      return;
    }

    const operations = products.flatMap((product) => [
      { index: { _index: this.indexName, _id: product.id } },
      this.withSuggestField(product),
    ]);

    const bulkResponse = await this.client.bulk({
      refresh: true,
      operations,
    });

    if (bulkResponse.errors) {
      this.logger.warn('Seed completed with some indexing errors.');
    }
  }

  private suggestionsFromFallback(
    query: string,
    suggestionSize: number,
    products: ProductDocument[],
  ): ProductSuggestionsResponse {
    const loweredQuery = query.toLowerCase();

    const suggestions = Array.from(
      new Set(
        products
          .map((product) => product.name)
          .filter((name) => name.toLowerCase().includes(loweredQuery))
          .slice(0, suggestionSize),
      ),
    );

    return {
      query,
      suggestions,
      source: 'fallback',
    };
  }

  private searchResultsFromFallback(
    query: string,
    resultSize: number,
    products: ProductDocument[],
  ): ProductSearchResultsResponse {
    const loweredQuery = query.toLowerCase();

    const scoredProducts = products
      .map((product) => {
        const searchHaystack = [
          product.name,
          product.brand,
          product.category,
          product.description,
          ...product.tags,
        ]
          .join(' ')
          .toLowerCase();

        let score = 0;
        if (product.name.toLowerCase().startsWith(loweredQuery)) {
          score += 4;
        }
        if (product.name.toLowerCase().includes(loweredQuery)) {
          score += 3;
        }
        if (product.brand.toLowerCase().includes(loweredQuery)) {
          score += 2;
        }
        if (searchHaystack.includes(loweredQuery)) {
          score += 1;
        }

        return { product, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    const results = scoredProducts
      .slice(0, resultSize)
      .map((entry) => entry.product);

    return {
      query,
      total: scoredProducts.length,
      results,
      source: 'fallback',
    };
  }

  private async syncPendingOperationsIfPossible(): Promise<void> {
    if (!this.isElasticsearchAvailable || this.pendingSyncById.size === 0) {
      return;
    }

    const pendingActions: PendingSyncAction[] = Array.from(this.pendingSyncById.values());

    try {
      const operations: Array<Record<string, unknown> | ProductDocument> = [];
      for (const action of pendingActions) {
        if (action.operation === 'index') {
          operations.push({ index: { _index: this.indexName, _id: action.product.id } });
          operations.push(this.withSuggestField(action.product));
          continue;
        }

        operations.push({ delete: { _index: this.indexName, _id: action.id } });
      }

      const bulkResponse = await this.client.bulk({
        refresh: 'wait_for',
        operations,
      });

      if (bulkResponse.errors) {
        const actionIds: string[] = pendingActions.map((action) =>
          action.operation === 'index' ? action.product.id : action.id,
        );
        const failedIds = new Set<string>();
        const bulkItems = bulkResponse.items as Array<{
          index?: { error?: unknown };
          delete?: { error?: unknown };
        }>;

        bulkItems.forEach((item, idx) => {
          const result = item.index ?? item.delete;
          if (result?.error) {
            failedIds.add(actionIds[idx]);
          }
        });

        for (const actionId of actionIds) {
          if (!failedIds.has(actionId)) {
            this.pendingSyncById.delete(actionId);
          }
        }

        this.logger.warn(
          `Pending sync completed with some errors (${failedIds.size} failed out of ${pendingActions.length}).`,
        );
        return;
      }

      this.pendingSyncById.clear();
      this.logger.log(`Synced ${pendingActions.length} queued product operations to Elasticsearch.`);
    } catch (error) {
      this.isElasticsearchAvailable = false;
      this.logger.warn(
        `Pending operations sync failed. Will retry later. ${(error as Error).message}`,
      );
    }
  }

  private async indexProduct(
    product: ProductDocument,
    refresh: 'wait_for' | boolean,
  ): Promise<void> {
    await this.client.index({
      index: this.indexName,
      id: product.id,
      document: this.withSuggestField(product),
      refresh,
    });
  }

  private async deleteFromIndex(
    id: string,
    refresh: 'wait_for' | boolean,
  ): Promise<void> {
    const documentExists = await this.client.exists({
      index: this.indexName,
      id,
    });

    if (!documentExists) {
      return;
    }

    await this.client.delete({
      index: this.indexName,
      id,
      refresh,
    });
  }

  private withSuggestField(product: ProductDocument): ProductDocument {
    return {
      ...product,
      suggest: {
        input: [product.name, product.brand, product.category, ...product.tags],
      },
    };
  }

  private buildProductDocument(input: ProductWriteRequest): ProductDocument {
    return {
      id: input.id.trim(),
      name: input.name.trim(),
      description: input.description.trim(),
      category: input.category.trim(),
      brand: input.brand.trim(),
      tags: input.tags.map((tag) => tag.trim()).filter((tag) => Boolean(tag)),
      price: input.price,
      inStock: input.inStock,
    };
  }

  private async upsertProductInDatabase(product: ProductDocument): Promise<void> {
    await this.databaseService.db
      .insert(productsTable)
      .values({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        brand: product.brand,
        tags: product.tags,
        price: product.price,
        inStock: product.inStock,
      })
      .onConflictDoUpdate({
        target: productsTable.id,
        set: {
          name: product.name,
          description: product.description,
          category: product.category,
          brand: product.brand,
          tags: product.tags,
          price: product.price,
          inStock: product.inStock,
        },
      });
  }

  private async removeFromDatabase(productId: string): Promise<boolean> {
    const deletedRows = await this.databaseService.db
      .delete(productsTable)
      .where(eq(productsTable.id, productId))
      .returning({ id: productsTable.id });

    return deletedRows.length > 0;
  }

  private mapDbRowToProduct(row: ProductRow): ProductDocument {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      brand: row.brand,
      tags: row.tags,
      price: row.price,
      inStock: row.inStock,
    };
  }
}
