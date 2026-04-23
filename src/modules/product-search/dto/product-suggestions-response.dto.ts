import { ApiProperty } from '@nestjs/swagger';

export class ProductSuggestionsResponseDto {
  @ApiProperty({ example: 'iph' })
  query: string;

  @ApiProperty({ type: [String], example: ['iphone', 'iphone 15'] })
  suggestions: string[];

  @ApiProperty({ enum: ['elasticsearch', 'fallback'], example: 'elasticsearch' })
  source: 'elasticsearch' | 'fallback';
}
