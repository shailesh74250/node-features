import { Router } from 'express';
import v1 from './v1/v1-router';

const router = Router();

router.use('/v1', v1);

export default router;
