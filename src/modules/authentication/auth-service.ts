import {Request, Response} from 'express';
import { StatusCodes } from "http-status-codes";
import { User } from '../../entity/user.entity';
import { appDataSource } from '../../app-data-source';

class AuthService {
  static register = async (data: any) => {
    console.log(data)
    const create_user_instance = appDataSource.getRepository(User).create(data);
    return await appDataSource.getRepository(User).save(create_user_instance);
  }
  static login(_req: Request, res: Response) {
    res.status(StatusCodes.OK).send({ message: 'Login successful' });
  }
  static resetPassword(_req: Request, res: Response) {
    res.status(StatusCodes.OK).send({ message: 'Login successful' });
  }
}

export default AuthService;