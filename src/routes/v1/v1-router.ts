import { Router } from 'express';
import testRouter from '../../modules/test-module/test-router';

const v1 = Router();

v1.use('/test', testRouter);

export default v1;
