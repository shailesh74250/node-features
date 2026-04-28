import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateDateTimeEventDto } from './dto/create-date-time-event.dto';
import {
  DayBoundaryQueryDto,
  FormatDateTimeQueryDto,
  ListEventsQueryDto,
} from './dto/date-time-query.dto';
import { DateTimeService } from './date-time.service';

@Controller('date-time')
export class DateTimeController {
  constructor(private readonly dateTimeService: DateTimeService) {}

  @Post('events')
  createEvent(@Body() payload: CreateDateTimeEventDto) {
    return this.dateTimeService.createEvent(payload);
  }

  @Get('events')
  listEvents(@Query() query: ListEventsQueryDto) {
    return this.dateTimeService.listEvents(query.timezone ?? 'UTC');
  }

  @Get('events/by-local-day')
  listEventsByLocalDay(
    @Query('date') date: string,
    @Query('timezone') timezone: string,
  ) {
    return this.dateTimeService.listEventsByLocalDay(date, timezone);
  }

  @Get('format')
  formatDateTime(@Query() query: FormatDateTimeQueryDto) {
    return this.dateTimeService.formatDateTime(query);
  }

  @Get('day-boundary')
  getDayBoundary(@Query() query: DayBoundaryQueryDto) {
    return this.dateTimeService.getDayBoundary(query);
  }
}
