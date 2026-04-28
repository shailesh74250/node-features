import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { and, asc, gte, lte, sql } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { DatabaseService } from '../../database/database.service';
import { CreateDateTimeEventDto } from './dto/create-date-time-event.dto';
import {
  DayBoundaryQueryDto,
  FormatDateTimeQueryDto,
} from './dto/date-time-query.dto';
import { dateTimeEvents } from './date-time.schema';

@Injectable()
export class DateTimeService implements OnModuleInit {
  constructor(private readonly databaseService: DatabaseService) {}

  async onModuleInit(): Promise<void> {
    await this.databaseService.db.execute(sql`
      CREATE TABLE IF NOT EXISTS date_time_events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        scheduled_at TIMESTAMPTZ NOT NULL,
        source_timezone VARCHAR(64) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  }

  async createEvent(payload: CreateDateTimeEventDto) {
    this.assertTimezone(payload.timezone);

    const localDateTime = DateTime.fromISO(payload.localDateTime, {
      zone: payload.timezone,
    });

    if (!localDateTime.isValid) {
      throw new BadRequestException(
        `Invalid localDateTime. Expected ISO-like value, received "${payload.localDateTime}"`,
      );
    }

    const utcDate = localDateTime.toUTC().toJSDate();

    const [createdEvent] = await this.databaseService.db
      .insert(dateTimeEvents)
      .values({
        title: payload.title,
        scheduledAt: utcDate,
        sourceTimezone: payload.timezone,
      })
      .returning();

    return this.mapEventForTimezone(createdEvent, payload.timezone);
  }

  async listEvents(timezone = 'UTC') {
    this.assertTimezone(timezone);

    const events = await this.databaseService.db
      .select()
      .from(dateTimeEvents)
      .orderBy(asc(dateTimeEvents.scheduledAt));

    return {
      timezone,
      count: events.length,
      events: events.map((event) => this.mapEventForTimezone(event, timezone)),
    };
  }

  formatDateTime(params: FormatDateTimeQueryDto) {
    this.assertTimezone(params.timezone);

    const parsed = DateTime.fromISO(params.iso, { zone: 'utc' });
    if (!parsed.isValid) {
      throw new BadRequestException(
        'Invalid ISO datetime in query param "iso".',
      );
    }

    const locale = params.locale ?? 'en-US';
    const zoned = parsed.setZone(params.timezone).setLocale(locale);

    return {
      inputIsoUtc: parsed.toISO(),
      timezone: params.timezone,
      locale,
      formatted: zoned.toFormat("cccc, dd LLL yyyy 'at' HH:mm:ss ZZZZ"),
      dayOfWeek: zoned.toFormat('cccc'),
      date: zoned.toISODate(),
      time: zoned.toFormat('HH:mm:ss'),
      offset: zoned.toFormat('ZZ'),
    };
  }

  getDayBoundary(params: DayBoundaryQueryDto) {
    this.assertTimezone(params.timezone);

    const localDate = DateTime.fromISO(params.date, { zone: params.timezone });
    if (!localDate.isValid) {
      throw new BadRequestException(
        'Invalid local date. Use YYYY-MM-DD format.',
      );
    }

    const startLocal = localDate.startOf('day');
    const endLocal = localDate.endOf('day');

    return {
      timezone: params.timezone,
      localDate: params.date,
      startOfDayLocal: startLocal.toISO(),
      endOfDayLocal: endLocal.toISO(),
      startOfDayUtc: startLocal.toUTC().toISO(),
      endOfDayUtc: endLocal.toUTC().toISO(),
    };
  }

  async listEventsByLocalDay(localDate: string, timezone: string) {
    this.assertTimezone(timezone);

    const local = DateTime.fromISO(localDate, { zone: timezone });
    if (!local.isValid) {
      throw new BadRequestException('Invalid date. Use YYYY-MM-DD format.');
    }

    const startUtc = local.startOf('day').toUTC().toJSDate();
    const endUtc = local.endOf('day').toUTC().toJSDate();

    const events = await this.databaseService.db
      .select()
      .from(dateTimeEvents)
      .where(
        and(
          gte(dateTimeEvents.scheduledAt, startUtc),
          lte(dateTimeEvents.scheduledAt, endUtc),
        ),
      )
      .orderBy(asc(dateTimeEvents.scheduledAt));

    return {
      timezone,
      localDate,
      count: events.length,
      events: events.map((event) => this.mapEventForTimezone(event, timezone)),
    };
  }

  private assertTimezone(timezone: string): void {
    try {
      Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
    } catch {
      throw new BadRequestException(`Unsupported timezone: ${timezone}`);
    }
  }

  private mapEventForTimezone(
    event: typeof dateTimeEvents.$inferSelect,
    timezone: string,
  ) {
    const utc = DateTime.fromJSDate(event.scheduledAt, { zone: 'utc' });
    const local = utc.setZone(timezone);

    return {
      id: event.id,
      title: event.title,
      sourceTimezone: event.sourceTimezone,
      scheduledAtUtc: utc.toISO(),
      scheduledAtLocal: local.toISO(),
      localDayOfWeek: local.toFormat('cccc'),
      localDate: local.toISODate(),
      localTime: local.toFormat('HH:mm:ss'),
      createdAtUtc: DateTime.fromJSDate(event.createdAt, {
        zone: 'utc',
      }).toISO(),
      updatedAtUtc: DateTime.fromJSDate(event.updatedAt, {
        zone: 'utc',
      }).toISO(),
    };
  }
}
