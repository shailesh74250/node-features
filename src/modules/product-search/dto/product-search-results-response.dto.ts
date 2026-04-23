import { ApiProperty } from '@nestjs/swagger';
import { ProductDto } from './product.dto';

export class ProductSearchResultsResponseDto {
  @ApiProperty({ example: 'iphone' })
  query: string;

  @ApiProperty({ example: 2 })
  total: number;

  @ApiProperty({ type: [ProductDto] })
  results: ProductDto[];

  @ApiProperty({ enum: ['elasticsearch', 'fallback'], example: 'elasticsearch' })
  source: 'elasticsearch' | 'fallback';
}
