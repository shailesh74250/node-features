import 'reflect-metadata';
import { DataSource } from 'typeorm';
import config from './config';

//const entities = [/* Add your entities here */];

export const appDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: 5432,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  schema: config.database.schema,
  synchronize: true,
  entities: [],
  migrations: [],
});