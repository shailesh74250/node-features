import { IsISO8601, IsOptional, IsString, Matches } from 'class-validator';

export class ListEventsQueryDto {
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class FormatDateTimeQueryDto {
  @IsISO8601()
  iso: string;

  @IsString()
  timezone: string;

  @IsOptional()
  @IsString()
  locale?: string;
}

export class DayBoundaryQueryDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string;

  @IsString()
  timezone: string;
}
