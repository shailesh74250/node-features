import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ProductSearchService } from './product-search.service';
import {
  ProductSearchResultsResponse,
  ProductSuggestionsResponse,
} from './product-search.types';

@ApiTags('products')
@Controller('v1/products')
export class ProductSearchController {
  constructor(private readonly productSearchService: ProductSearchService) {}

  @Get('suggestions')
  @ApiOperation({
    summary: 'Get product autocomplete suggestions',
    description:
      'Returns suggestion terms for the typed query prefix. This endpoint is optimized for search box autocomplete.',
  })
  @ApiQuery({ name: 'query', type: String, required: true })
  @ApiQuery({ name: 'suggestionSize', type: Number, required: false, example: 5 })
  @ApiOkResponse({
    description: 'Suggestions fetched successfully',
    schema: {
      type: 'object',
      properties: {
        query: { type: 'string', example: 'iph' },
        suggestions: {
          type: 'array',
          items: { type: 'string' },
          example: ['iphone', 'iphone 15'],
        },
        source: { type: 'string', enum: ['elasticsearch', 'fallback'] },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'query is required' })
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
  @ApiOperation({
    summary: 'Search products',
    description:
      'Returns full product search results based on relevance across name, brand, category, description, and tags.',
  })
  @ApiQuery({ name: 'query', type: String, required: true })
  @ApiQuery({ name: 'resultSize', type: Number, required: false, example: 20 })
  @ApiOkResponse({
    description: 'Search results fetched successfully',
    schema: {
      type: 'object',
      properties: {
        query: { type: 'string', example: 'iphone' },
        total: { type: 'number', example: 2 },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'P-1001' },
              name: { type: 'string', example: 'Apple iPhone 15 Pro' },
              description: {
                type: 'string',
                example:
                  '6.1-inch display, A17 Pro chip, and advanced triple camera system.',
              },
              category: { type: 'string', example: 'Smartphones' },
              brand: { type: 'string', example: 'Apple' },
              tags: { type: 'array', items: { type: 'string' }, example: ['iphone'] },
              price: { type: 'number', example: 999 },
              inStock: { type: 'boolean', example: true },
            },
          },
        },
        source: { type: 'string', enum: ['elasticsearch', 'fallback'] },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'query is required' })
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
