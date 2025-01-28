import 'reflect-metadata';
import { DataSource } from 'typeorm';
import config from './config';
import { User } from './entity/user.entity';

const entities = [User];

export const appDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: 5432,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  schema: config.database.schema,
  synchronize: true,
  entities: entities,
  migrations: [],
});