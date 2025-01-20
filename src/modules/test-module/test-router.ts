import {Router} from 'express';
import TestController from './test-controller';

const router = Router();

router.get('/login', TestController.test);

export default router;