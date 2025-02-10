import winston from 'winston';
import LokiTransport from 'winston-loki';

const logger = winston.createLogger({
  transports: [
    new LokiTransport({
      host: 'http://192.168.1.3:3100', // Replace with your Loki server URL
      json: true,
      labels: { app: 'my-node-app' }, // Custom labels for better filtering in Grafana
      format: winston.format.json(),
      onConnectionError: (err) => console.error('Loki Connection Error:', err),
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Export the logger
export default logger;
