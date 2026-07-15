import { Params } from 'nestjs-pino';

/**
 * Structured JSON logs everywhere, tagged with the emitting service so logs
 * from all three apps can be correlated when read together.
 */
export const buildPinoConfig = (serviceName: string): Params => ({
  pinoHttp: {
    name: serviceName,
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { singleLine: true, colorize: true } }
        : undefined,
    redact: ['req.headers.authorization'],
    customProps: () => ({ service: serviceName }),
  },
});
