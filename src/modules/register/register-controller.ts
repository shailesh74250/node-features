import {Request, Response} from 'express';
import { StatusCodes } from "http-status-codes";

class RegisterController {
  static register = async (_req: Request, res: Response) => {
    res.status(StatusCodes.OK).send({ message: 'Registration successful' });
  }
}

export default RegisterController;