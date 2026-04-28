import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDateTimeEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @IsString()
  @IsNotEmpty()
  localDateTime: string;

  @IsString()
  @IsNotEmpty()
  timezone: string;
}
