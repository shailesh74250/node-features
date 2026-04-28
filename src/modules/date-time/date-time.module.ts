import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { DateTimeController } from './date-time.controller';
import { DateTimeService } from './date-time.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DateTimeController],
  providers: [DateTimeService],
})
export class DateTimeModule {}
