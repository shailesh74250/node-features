import { ApiProperty } from '@nestjs/swagger';
import { ProductDto } from './product.dto';

export class ProductUpsertResponseDto {
  @ApiProperty({ type: ProductDto })
  product: ProductDto;

  @ApiProperty({ enum: ['indexed', 'queued'], example: 'indexed' })
  syncStatus: 'indexed' | 'queued';

  @ApiProperty({
    example: 'Product was indexed in Elasticsearch and is now searchable.',
  })
  message: string;
}
