import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ProductSearchService } from './product-search.service';
import {
  ProductSearchResultsResponse,
  ProductSuggestionsResponse,
} from './product-search.types';

@Controller('v1/products')
export class ProductSearchController {
  constructor(private readonly productSearchService: ProductSearchService) {}

  @Get('suggestions')
  async getSuggestions(
    @Query('query') query: string,
    @Query('suggestionSize', new DefaultValuePipe(5), ParseIntPipe)
    suggestionSize: number,
  ): Promise<ProductSuggestionsResponse> {
    if (!query || !query.trim()) {
      throw new BadRequestException('query is required');
    }

    const boundedSuggestionSize = Math.min(Math.max(suggestionSize, 1), 20);

    return this.productSearchService.getSuggestions(query, boundedSuggestionSize);
  }

  @Get('search')
  async searchProducts(
    @Query('query') query: string,
    @Query('resultSize', new DefaultValuePipe(20), ParseIntPipe)
    resultSize: number,
  ): Promise<ProductSearchResultsResponse> {
    if (!query || !query.trim()) {
      throw new BadRequestException('query is required');
    }

    const boundedResultSize = Math.min(Math.max(resultSize, 1), 100);

    return this.productSearchService.searchProducts(query, boundedResultSize);
  }
}
