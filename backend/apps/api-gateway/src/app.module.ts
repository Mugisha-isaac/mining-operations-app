import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { buildPinoConfig } from '@minetech/common';
import configuration from './config/configuration';
import { ProxyModule } from './modules/proxy/proxy.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    LoggerModule.forRoot(buildPinoConfig('api-gateway')),
    ProxyModule,
    HealthModule,
  ],
})
export class AppModule {}
