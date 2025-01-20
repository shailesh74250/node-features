import { Router } from 'express';
import testRouter from '../../modules/test-module/test-router';

const v1 = Router();

v1.use('/auth', testRouter);

export default v1;
