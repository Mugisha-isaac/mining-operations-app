import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { QueueName, RABBITMQ_EXCHANGE, RABBITMQ_EXCHANGE_TYPE } from '@minetech/common';
import { IncidentCreatedConsumer } from './incident-created.consumer';
import { NotificationProcessor } from './notification.processor';
import { OperationsGrpcClientModule } from '../../grpc-client/operations-grpc-client.module';

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('rabbitmq.uri', 'amqp://minetech:minetech@localhost:5672'),
        exchanges: [{ name: RABBITMQ_EXCHANGE, type: RABBITMQ_EXCHANGE_TYPE }],
        connectionInitOptions: { wait: false },
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: { host: config.get<string>('redis.host'), port: config.get<number>('redis.port') },
      }),
    }),
    BullModule.registerQueue({ name: QueueName.NOTIFICATIONS }),
    OperationsGrpcClientModule,
  ],
  providers: [IncidentCreatedConsumer, NotificationProcessor],
})
export class NotificationsModule {}
