import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { Product, CreateProductInput } from './product.dto';

@Resolver(() => Product)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Query(() => [Product], { name: 'getProducts' })
  async getProducts() {
    return this.productService.findAll();
  }

  @Mutation(() => Product)
  async createProduct(@Args('input') input: CreateProductInput) {
    return this.productService.create(input);
  }
}
