import compression from 'compression';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import YAML from 'yamljs';
import helmet from 'helmet';
import router from './routes/api-router';
import healthCheck from './modules/health-check/health-check-router';
import winstonLogger from './utils/winston';
import { metricsEndpoint, metricsMiddleware } from './metrics';
import logger from './logger';

const app = express();
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yml'));

// Example request logging middleware
app.use((req, _res, next) => {
    logger.info(`Incoming request: ${req.method} ${req.url}`, { route: req.url, method: req.method });
    next();
  });
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(winstonLogger);
// Use metrics middleware
app.use(metricsMiddleware);
app.get('/error', (_req, res) => {
    logger.error('This is an error log', { statusCode: 500 });
    res.status(500).send('Error occurred');
  });

  app.get('/', (_req, res) => {
    logger.info('Hello, World! Request received.');
    res.send('Hello, World!');
  });   

// define api routes
app.use('/api', router);
app.use('/health-check', healthCheck);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Metrics endpoint
app.get('/metrics', metricsEndpoint);

export default app;
