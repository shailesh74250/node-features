import * as compression from 'compression';
import * as express from 'express';
import * as swaggerUi from 'swagger-ui-express';
import * as path from 'path';
import * as YAML from 'yamljs';
import helmet from 'helmet';
import router from './routes/api-router';
import healthCheck from './modules/health-check/health-check-router';
import winstonLogger from './utils/winston';

const app = express();
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yml'));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(winstonLogger);

// define api routes
app.use('/api', router);
app.use('/health-check', healthCheck);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;
