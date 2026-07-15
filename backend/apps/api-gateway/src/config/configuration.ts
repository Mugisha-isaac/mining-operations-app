export default () => ({
  port: parseInt(process.env.API_GATEWAY_PORT ?? '3000', 10),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  coreServiceUrl: process.env.CORE_SERVICE_URL ?? 'http://localhost:3001',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
});
