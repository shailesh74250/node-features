import { Router } from 'express';
import loginRouter from '../../modules/login/login-router';
import registerRouter from '../../modules/register/register-router';

const v1 = Router();

v1.use('/auth', loginRouter);
v1.use('/auth', registerRouter);

export default v1;
