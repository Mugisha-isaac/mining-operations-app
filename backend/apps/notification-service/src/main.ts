import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  app.useLogger(app.get(Logger));

  const port = config.get<number>('port', 3002);
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`notification-service HTTP (health only) listening on ${port}`);
  logger.log('Consuming incident.created events from RabbitMQ, processing via Bull queue');
}

bootstrap();
