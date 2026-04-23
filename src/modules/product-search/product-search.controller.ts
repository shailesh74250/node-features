import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DeleteProductParamsDto } from './dto/delete-product-params.dto';
import { ProductDeleteResponseDto } from './dto/product-delete-response.dto';
import { ProductDto } from './dto/product.dto';
import { ProductSearchResultsResponseDto } from './dto/product-search-results-response.dto';
import { ProductSuggestionsResponseDto } from './dto/product-suggestions-response.dto';
import { ProductUpsertResponseDto } from './dto/product-upsert-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpsertProductDto } from './dto/upsert-product.dto';
import { ProductSearchService } from './product-search.service';
import {
  ProductDeleteResponse,
  ProductSearchResultsResponse,
  ProductSuggestionsResponse,
  ProductUpsertResponse,
} from './product-search.types';

@ApiTags('products')
@Controller('v1/products')
export class ProductSearchController {
  constructor(private readonly productSearchService: ProductSearchService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create product',
    description: 'Creates a new product and syncs it to Elasticsearch.',
  })
  @ApiBody({ type: UpsertProductDto })
  @ApiCreatedResponse({
    description: 'Product created and sync status returned',
    type: ProductUpsertResponseDto,
  })
  @ApiConflictResponse({ description: 'Product id already exists' })
  @ApiBadRequestResponse({ description: 'Invalid product payload' })
  @ApiUnauthorizedResponse({
    description: 'Invalid admin key when ADMIN_API_KEY is configured',
  })
  async createProduct(
    @Body() body: UpsertProductDto,
    @Headers('x-admin-key') adminKey?: string,
  ): Promise<ProductUpsertResponse> {
    this.validateAdminKey(adminKey);

    if (this.productSearchService.hasProduct(body.id)) {
      throw new ConflictException(`Product with id ${body.id} already exists`);
    }

    return this.productSearchService.upsertProduct(body);
  }

  @Get()
  @ApiOperation({
    summary: 'List products',
    description: 'Returns all products in the catalog.',
  })
  @ApiOkResponse({
    description: 'Products fetched successfully',
    type: ProductDto,
    isArray: true,
  })
  listProducts(): ProductDto[] {
    return this.productSearchService.listProducts();
  }

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
    type: ProductSuggestionsResponseDto,
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
    type: ProductSearchResultsResponseDto,
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

  @Get(':id')
  @ApiOperation({
    summary: 'Get product by id',
    description: 'Returns one product by its unique id.',
  })
  @ApiParam({ name: 'id', type: String, example: 'P-1010' })
  @ApiOkResponse({
    description: 'Product fetched successfully',
    type: ProductDto,
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  getProductById(@Param() params: DeleteProductParamsDto): ProductDto {
    const product = this.productSearchService.getProductById(params.id);
    if (!product) {
      throw new NotFoundException(`Product ${params.id} not found`);
    }

    return product;
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update product',
    description: 'Updates an existing product and syncs the latest version to Elasticsearch.',
  })
  @ApiParam({ name: 'id', type: String, example: 'P-1010' })
  @ApiBody({ type: UpdateProductDto })
  @ApiOkResponse({
    description: 'Product updated and sync status returned',
    type: ProductUpsertResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiBadRequestResponse({ description: 'Invalid product payload' })
  @ApiUnauthorizedResponse({
    description: 'Invalid admin key when ADMIN_API_KEY is configured',
  })
  async updateProduct(
    @Param() params: DeleteProductParamsDto,
    @Body() body: UpdateProductDto,
    @Headers('x-admin-key') adminKey?: string,
  ): Promise<ProductUpsertResponse> {
    this.validateAdminKey(adminKey);

    if (!this.productSearchService.hasProduct(params.id)) {
      throw new NotFoundException(`Product ${params.id} not found`);
    }

    return this.productSearchService.upsertProduct({
      id: params.id,
      ...body,
    });
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete product',
    description:
      'Deletes a product from the catalog and synchronizes the delete to Elasticsearch. If Elasticsearch is down, delete is queued for retry.',
  })
  @ApiParam({ name: 'id', type: String, example: 'P-1010' })
  @ApiOkResponse({
    description: 'Product delete accepted with synchronization status',
    type: ProductDeleteResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiUnauthorizedResponse({
    description: 'Invalid admin key when ADMIN_API_KEY is configured',
  })
  async deleteProduct(
    @Param() params: DeleteProductParamsDto,
    @Headers('x-admin-key') adminKey?: string,
  ): Promise<ProductDeleteResponse> {
    this.validateAdminKey(adminKey);

    if (!this.productSearchService.hasProduct(params.id)) {
      throw new NotFoundException(`Product ${params.id} not found`);
    }

    return this.productSearchService.deleteProduct(params.id);
  }

  private validateAdminKey(adminKey?: string): void {
    const expectedAdminKey = process.env.ADMIN_API_KEY;
    if (!expectedAdminKey) {
      return;
    }

    if (adminKey !== expectedAdminKey) {
      throw new UnauthorizedException('Invalid admin key');
    }
  }
}
