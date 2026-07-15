import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Tenant } from '../modules/tenants/tenant.entity';
import { User } from '../modules/users/user.entity';
import { Worker } from '../modules/workers/worker.entity';
import { Shift } from '../modules/workers/shift.entity';
import { Incident } from '../modules/incidents/incident.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'minetech',
  password: process.env.DB_PASSWORD ?? 'minetech',
  database: process.env.DB_NAME ?? 'minetech',
  entities: [Tenant, User, Worker, Shift, Incident],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: false,
});
