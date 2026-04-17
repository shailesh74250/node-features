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
