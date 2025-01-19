import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

class HealthCheckController {
  static ping = async (_req: Request, res: Response): Promise<void> => {
    res.status(StatusCodes.OK).send({ status: 'OK' });
  };
}
export default HealthCheckController;
