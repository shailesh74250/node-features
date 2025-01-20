import {Router} from 'express';
import LoginController from './login-controller';

const router = Router();

router.get('/login', LoginController.login);

export default router;