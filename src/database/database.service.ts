import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly client: ReturnType<typeof postgres>;
  readonly db: PostgresJsDatabase;

  constructor() {
    const connectionString =
      process.env.DATABASE_URL ??
      'postgres://postgres:postgres@localhost:5432/node_features';

    this.client = postgres(connectionString, {
      max: 10,
      prepare: false,
    });

    this.db = drizzle(this.client);
  }

  async onModuleInit(): Promise<void> {
    await this.client`SELECT 1`;
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.end({ timeout: 5 });
  }
}
