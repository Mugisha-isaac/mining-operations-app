import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  // bodyParser disabled: this service proxies raw request streams
  // (including multipart incident-photo uploads) straight through to
  // core-service instead of parsing and re-serializing them.
  const app = await NestFactory.create(AppModule, { bufferLogs: true, bodyParser: false });
  const config = app.get(ConfigService);
  app.useLogger(app.get(Logger));
  app.enableCors({ origin: config.get<string>('corsOrigin'), credentials: true });

  const port = config.get<number>('port', 3000);
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`api-gateway listening on ${port}, proxying to ${config.get('coreServiceUrl')}`);
}

bootstrap();
