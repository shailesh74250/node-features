import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty({ example: 'P-1010' })
  id: string;

  @ApiProperty({ example: 'Apple Watch Ultra 2' })
  name: string;

  @ApiProperty({
    example: 'Premium smartwatch with GPS, titanium case, and long battery life.',
  })
  description: string;

  @ApiProperty({ example: 'Wearables' })
  category: string;

  @ApiProperty({ example: 'Apple' })
  brand: string;

  @ApiProperty({ type: [String], example: ['watch', 'wearable', 'fitness'] })
  tags: string[];

  @ApiProperty({ example: 799 })
  price: number;

  @ApiProperty({ example: true })
  inStock: boolean;
}
