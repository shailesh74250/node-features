import { Router } from 'express';
import uploadRouter from '../../modules/upload/upload-router'
const v1 = Router();

v1.use('/upload', uploadRouter);

export default v1;
