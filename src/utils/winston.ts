import * as winston from 'winston';
import * as expressWinston from 'express-winston';

export default expressWinston.logger({
  transports: [new winston.transports.Console()],
  format: winston.format.json(),
  meta: true,
  expressFormat: true,
  requestWhitelist: [],
  responseWhitelist: [],
  ignoreRoute: function (req) {
    // ignore logs for health check route and swagger-api
    return req.originalUrl === '/health-check/ping' || req.originalUrl.includes('/docs');
  },
  dynamicMeta: function (req, res) {
    // Add any properties from req/res here to be logged under the 'meta' object
    return {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
    };
  },
});
