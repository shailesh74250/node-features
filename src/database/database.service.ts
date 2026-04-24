import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly pool: Pool;
  readonly db: NodePgDatabase;

  constructor() {
    const connectionString =
      process.env.DATABASE_URL ??
      'postgres://postgres:postgres@localhost:5432/node_features';

    this.pool = new Pool({
      connectionString,
    });
    this.db = drizzle(this.pool);
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}