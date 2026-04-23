import { ApiProperty } from '@nestjs/swagger';

export class ProductDeleteResponseDto {
  @ApiProperty({ example: 'P-1010' })
  id: string;

  @ApiProperty({ example: true })
  deleted: boolean;

  @ApiProperty({ enum: ['indexed', 'queued'], example: 'indexed' })
  syncStatus: 'indexed' | 'queued';

  @ApiProperty({ example: 'Product deletion synced to Elasticsearch.' })
  message: string;
}
