export default () => ({
  port: parseInt(process.env.NOTIFICATION_SERVICE_PORT ?? '3002', 10),
  rabbitmq: {
    uri: process.env.RABBITMQ_URI ?? 'amqp://minetech:minetech@localhost:5672',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },
  coreServiceGrpcUrl: process.env.CORE_SERVICE_GRPC_URL ?? 'localhost:5001',
});
