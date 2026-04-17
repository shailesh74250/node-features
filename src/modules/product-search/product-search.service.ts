import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { sampleProducts } from './sample-products';
import {
  ProductDocument,
  ProductSearchResultsResponse,
  ProductSuggestionsResponse,
} from './product-search.types';

@Injectable()
export class ProductSearchService implements OnModuleInit {
  private readonly logger = new Logger(ProductSearchService.name);
  private readonly indexName = process.env.ES_PRODUCTS_INDEX ?? 'products';
  private readonly client: Client;
  private isElasticsearchAvailable = false;

  constructor() {
    const esNode = process.env.ES_NODE ?? 'http://localhost:9200';
    const username = process.env.ES_USERNAME;
    const password = process.env.ES_PASSWORD;

    this.client = new Client({
      node: esNode,
      auth: username && password ? { username, password } : undefined,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.initializeElasticsearch();
  }

  async getSuggestions(
    query: string,
    suggestionSize: number,
  ): Promise<ProductSuggestionsResponse> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return {
        query,
        suggestions: [],
        source: this.isElasticsearchAvailable ? 'elasticsearch' : 'fallback',
      };
    }

    if (!this.isElasticsearchAvailable) {
      return this.suggestionsFromFallback(normalizedQuery, suggestionSize);
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

      const suggestOptions = suggestResponse.suggest?.product_suggestions?.[0]?.options;
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
        `Elasticsearch suggestions query failed. Falling back to in-memory suggestions. ${(error as Error).message}`,
      );
      return this.suggestionsFromFallback(normalizedQuery, suggestionSize);
    }
  }

  async searchProducts(
    query: string,
    resultSize: number,
  ): Promise<ProductSearchResultsResponse> {
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
      return this.searchResultsFromFallback(normalizedQuery, resultSize);
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
        `Elasticsearch search query failed. Falling back to in-memory results. ${(error as Error).message}`,
      );
      return this.searchResultsFromFallback(normalizedQuery, resultSize);
    }
  }

  private async initializeElasticsearch(): Promise<void> {
    try {
      await this.client.ping();
      await this.ensureIndex();
      await this.seedProductsIfNeeded();
      this.isElasticsearchAvailable = true;
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
    const indexExists = await this.client.indices.exists({ index: this.indexName });
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

    const operations = sampleProducts.flatMap((product) => [
      { index: { _index: this.indexName, _id: product.id } },
      {
        ...product,
        suggest: {
          input: [product.name, product.brand, product.category, ...product.tags],
        },
      },
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
  ): ProductSuggestionsResponse {
    const loweredQuery = query.toLowerCase();

    const suggestions = Array.from(
      new Set(
        sampleProducts
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
  ): ProductSearchResultsResponse {
    const loweredQuery = query.toLowerCase();

    const scoredProducts = sampleProducts
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
}
