import * as request from 'supertest';
import app from '../../app';

//==================== health check API test ====================

/**
 * Testing Health Check endpoint
 */

describe('GET /health check api endpoint', () => {
  it('Health Check API Request - 200', async () => {
    const result = await request(app).get('/health-check/ping');

    expect(result.body.status).toEqual('OK');
    expect(result.status).toEqual(200);
  });
});
