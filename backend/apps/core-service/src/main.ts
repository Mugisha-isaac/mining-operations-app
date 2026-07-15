import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { OPERATIONS_PACKAGE, OPERATIONS_PROTO_PATH } from '@minetech/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);

  app.useLogger(app.get(Logger));
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  app.enableCors({ origin: config.get<string>('corsOrigin'), credentials: true });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MineTech Core Service')
    .setDescription('Workforce and safety-incident API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // gRPC server, attached to the same app so it shares the DI container -
  // this is what notification-service calls for GetIncidentDetail.
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: OPERATIONS_PACKAGE,
      protoPath: OPERATIONS_PROTO_PATH,
      url: `0.0.0.0:${config.get<number>('grpcPort')}`,
    },
  });

  await app.startAllMicroservices();
  const port = config.get<number>('port', 3001);
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`core-service HTTP listening on ${port}, gRPC on ${config.get('grpcPort')}`);
}

bootstrap();
