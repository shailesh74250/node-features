import { Router } from 'express';
import UploadController from './upload-controller';

const router = Router();

router.post('/video', UploadController.video);
router.post('/audio', UploadController.audio);
router.post('/file', UploadController.file);

export default router;
