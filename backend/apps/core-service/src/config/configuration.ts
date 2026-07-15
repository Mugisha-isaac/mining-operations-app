export default () => ({
  port: parseInt(process.env.CORE_SERVICE_PORT ?? '3001', 10),
  grpcPort: parseInt(process.env.CORE_SERVICE_GRPC_PORT ?? '5001', 10),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'minetech',
    password: process.env.DB_PASSWORD ?? 'minetech',
    name: process.env.DB_NAME ?? 'minetech',
  },
  rabbitmq: {
    uri: process.env.RABBITMQ_URI ?? 'amqp://minetech:minetech@localhost:5672',
  },
  minio: {
    endpoint: process.env.MINIO_ENDPOINT ?? 'localhost',
    port: parseInt(process.env.MINIO_PORT ?? '9000', 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY ?? 'minetech',
    secretKey: process.env.MINIO_SECRET_KEY ?? 'minetech123',
    bucket: process.env.MINIO_BUCKET ?? 'incident-photos',
  },
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
});
