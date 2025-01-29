import {Router} from 'express';
import AuthController from './auth-controller';

const router = Router();

router.get('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/reset-password', AuthController.resetPassword);

export default router;