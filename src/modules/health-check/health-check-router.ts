import { Router } from 'express';
import HealthCheckController from './health-check-controller';

const router = Router();

//Check service Health
/**
 * @api {get} /healthcheck/ping return health status
 * @apiName Ping
 * @apiVersion 0.0.1
 * @apiGroup Healthcheck
 *
 * @apiSuccess {String} status status of the Service.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "OK"
 *     }
 */
router.get('/ping', HealthCheckController.ping);

export default router;
