export interface ProductDocument {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  tags: string[];
  price: number;
  inStock: boolean;
  suggest?: {
    input: string[];
  };
}

export interface ProductWriteRequest {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  tags: string[];
  price: number;
  inStock: boolean;
}

export interface ProductUpsertResponse {
  product: ProductDocument;
  syncStatus: 'indexed' | 'queued';
  message: string;
}

export interface ProductDeleteResponse {
  id: string;
  deleted: boolean;
  syncStatus: 'indexed' | 'queued';
  message: string;
}

export type PendingSyncAction =
  | {
      operation: 'index';
      product: ProductDocument;
    }
  | {
      operation: 'delete';
      id: string;
    };

export interface ProductSuggestionsResponse {
  query: string;
  suggestions: string[];
  source: 'elasticsearch' | 'fallback';
}

export interface ProductSearchResultsResponse {
  query: string;
  total: number;
  results: ProductDocument[];
  source: 'elasticsearch' | 'fallback';
}
