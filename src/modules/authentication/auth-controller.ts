import {Request, Response} from 'express';
import { StatusCodes } from "http-status-codes";
import authService from './auth-service';

class AuthController {
  static register = async (req: Request, res: Response) => {
    // get data from request and insert into table
    const data = req.body;
    console.log(data)
    const result = await authService.register(data);
    res.status(StatusCodes.OK).send({ message: result });
  }
  static login(_req: Request, res: Response) {
    res.status(StatusCodes.OK).send({ message: 'Login successful' });
  }
  static resetPassword(_req: Request, res: Response) {
    res.status(StatusCodes.OK).send({ message: 'Login successful' });
  }
}

export default AuthController;