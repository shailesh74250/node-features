import { Router } from 'express';
import authRouter from '../../modules/authentication/auth-router';

const v1 = Router();

v1.use('/auth', authRouter);

export default v1;
