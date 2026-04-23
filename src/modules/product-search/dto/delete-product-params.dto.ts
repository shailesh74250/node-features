import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteProductParamsDto {
  @ApiProperty({ example: 'P-1010' })
  @IsString()
  @IsNotEmpty()
  id: string;
}
