import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class UpdateProductDto {
  @ApiProperty({ example: 'Apple Watch Ultra 2' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example:
      'Premium smartwatch with GPS, titanium case, and long battery life.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Wearables' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'Apple' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ type: [String], example: ['watch', 'wearable', 'fitness'] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  tags: string[];

  @ApiProperty({ example: 799 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  inStock: boolean;
}
