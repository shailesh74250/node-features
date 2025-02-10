import {Router} from 'express';
import TestController from './test-controller';

const router = Router();

router.get('/fast', TestController.fast);
router.get('/delay', TestController.delay);

export default router;