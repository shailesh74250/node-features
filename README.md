# Date/Time + Day Handling with PostgreSQL and Drizzle

This project now includes a real implementation for timezone-aware date/time handling in NestJS.

## What this demonstrates

- Store all timestamps in UTC (`TIMESTAMPTZ` in PostgreSQL).
- Accept user input in local timezone and convert to UTC at write-time.
- Render timestamps in any timezone at read-time.
- Compute local day boundaries and map them to UTC windows for reliable DB filtering.

## Stack used

- NestJS
- PostgreSQL
- Drizzle ORM (`drizzle-orm` + `postgres` driver)
- Luxon for timezone-safe datetime conversion/formatting

## Environment

Set in `.env`:

```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/node_features
```

## Run

```bash
npm install
npm run start:dev
```

When the app starts, the `date_time_events` table is auto-created if missing.

## API Endpoints

### 1) Create event using local datetime + timezone

`POST /date-time/events`

```json
{
	"title": "India team standup",
	"localDateTime": "2026-04-25T09:30:00",
	"timezone": "Asia/Kolkata"
}
```

Behavior:
- Input is interpreted in `Asia/Kolkata`.
- Converted to UTC.
- UTC timestamp is stored in PostgreSQL.

### 2) List events rendered for a timezone

`GET /date-time/events?timezone=America/New_York`

Response includes:
- `scheduledAtUtc`
- `scheduledAtLocal`
- `localDayOfWeek`
- `localDate`
- `localTime`

### 3) Format one ISO timestamp for locale + timezone

`GET /date-time/format?iso=2026-04-25T10:00:00Z&timezone=Europe/Berlin&locale=de-DE`

Useful for display formatting and weekday extraction.

### 4) Get local day boundary mapped to UTC

`GET /date-time/day-boundary?date=2026-04-25&timezone=Asia/Tokyo`

Returns local start/end of day and corresponding UTC start/end. This is exactly how real systems safely query "all records for local day X".

### 5) Query events by local day + timezone

`GET /date-time/events/by-local-day?date=2026-04-25&timezone=Asia/Kolkata`

Internally converts day boundary to UTC and filters in DB.

## Golden rule

- Write in UTC.
- Read in user's timezone.
- Use local-day boundary to UTC conversion for day-based reports.

