import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OPERATIONS_PACKAGE, OPERATIONS_PROTO_PATH } from '@minetech/common';

export const OPERATIONS_CLIENT = 'OPERATIONS_CLIENT';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: OPERATIONS_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: OPERATIONS_PACKAGE,
            protoPath: OPERATIONS_PROTO_PATH,
            url: config.get<string>('coreServiceGrpcUrl'),
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class OperationsGrpcClientModule {}
