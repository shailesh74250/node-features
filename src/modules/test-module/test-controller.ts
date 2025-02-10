import {Request, Response} from 'express';
import {StatusCodes} from 'http-status-codes';

class TestController {
  static fast(_req: Request, res: Response) {
    res.status(StatusCodes.OK).send({ message: 'Fast Route' });
  }
  static delay(_req: Request, res: Response) {
    setTimeout(() => {
      return  res.status(StatusCodes.OK).send({ message: 'Delay Route' });
    }, 3000);
  }
}

export default TestController;