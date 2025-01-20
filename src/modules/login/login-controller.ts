import {Request, Response} from 'express';
import {StatusCodes} from 'http-status-codes';

class LoginController {
  static login(_req: Request, res: Response) {
    res.status(StatusCodes.OK).send({ message: 'Login successful' });
  }
}

export default LoginController;