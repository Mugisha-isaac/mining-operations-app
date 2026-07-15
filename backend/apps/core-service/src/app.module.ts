import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { buildPinoConfig, RABBITMQ_EXCHANGE, RABBITMQ_EXCHANGE_TYPE } from '@minetech/common';

import configuration from './config/configuration';
import { Tenant } from './modules/tenants/tenant.entity';
import { User } from './modules/users/user.entity';
import { Worker } from './modules/workers/worker.entity';
import { Shift } from './modules/workers/shift.entity';
import { Incident } from './modules/incidents/incident.entity';

import { AuthModule } from './modules/auth/auth.module';
import { WorkersModule } from './modules/workers/workers.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { StorageModule } from './modules/storage/storage.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { HealthModule } from './modules/health/health.module';
import { OperationsGrpcController } from './grpc/operations.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    LoggerModule.forRoot(buildPinoConfig('core-service')),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.name'),
        entities: [Tenant, User, Worker, Shift, Incident],
        synchronize: false,
        logging: false,
      }),
    }),
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('rabbitmq.uri', 'amqp://minetech:minetech@localhost:5672'),
        exchanges: [{ name: RABBITMQ_EXCHANGE, type: RABBITMQ_EXCHANGE_TYPE }],
        connectionInitOptions: { wait: false },
      }),
    }),
    AuthModule,
    StorageModule,
    RealtimeModule,
    WorkersModule,
    IncidentsModule,
    DashboardModule,
    HealthModule,
  ],
  controllers: [OperationsGrpcController],
})
export class AppModule {}
