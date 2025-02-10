import * as client from 'prom-client'; // ✅ Correct way

// Create a registry to hold the metrics
const register = new client.Registry();

// Default system metrics
client.collectDefaultMetrics({ register });

// Define a custom HTTP request counter
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Define a histogram for request duration
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5], // Define custom bucket ranges
});

// Register metrics
register.registerMetric(httpRequestCounter);
register.registerMetric(httpRequestDuration);

// Middleware to track metrics
export const metricsMiddleware = (req: any, res: any, next: any) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds + nanoseconds / 1e9;

    httpRequestCounter.inc({ method: req.method, route: req.path, status_code: res.statusCode });
    httpRequestDuration.observe({ method: req.method, route: req.path, status_code: res.statusCode }, duration);
  });

  next();
};

// Expose metrics endpoint
export const metricsEndpoint = async (_req: any, res: any) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};
