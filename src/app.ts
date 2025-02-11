import * as compression from 'compression';
import * as express from 'express';
import * as swaggerUi from 'swagger-ui-express';
import * as path from 'path';
import * as YAML from 'yamljs';
import helmet from 'helmet';
import router from './routes/api-router';
import healthCheck from './modules/health-check/health-check-router';
import winstonLogger from './utils/winston';
import { cacheData, getCachedData } from './cache';
import { sendNotification } from './pubsub';


const app = express();
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yml'));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(winstonLogger);

// Mock database function
const fetchDataFromDB = async () => {
  return { data: '🚀 Expensive DB Query Result', timestamp: new Date() };
};

app.get('/data', async (_req, res) => {
  const cacheKey = 'api:data';

  // Check Redis Cache
  const cachedData = await getCachedData(cacheKey);
  if (cachedData) {
    return res.json({ source: 'cache', ...cachedData });
  }

  // Fetch from DB if not in cache
  const freshData = await fetchDataFromDB();
  await cacheData(cacheKey, freshData, 30); // Cache for 30 seconds

  return res.json({ source: 'database', ...freshData });
});

app.post('/notify', (req, res) => {
  const { message } = req.body;
  sendNotification(message);
  res.json({ success: true, message: 'Notification sent!' });
}); // Now, microservices can communicate using Redis!

// define api routes
app.use('/api', router);
app.use('/health-check', healthCheck);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;
