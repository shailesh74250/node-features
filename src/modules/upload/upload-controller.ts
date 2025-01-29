import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import uploadServide from './upload-service';

class UploadController {

  static video = async (req: Request, res: Response): Promise<void> => {
    const data = req.body;
    await uploadServide.video(data)
    res.status(StatusCodes.OK).send({ status: 'OK' });
  };

  static file = async (_req: Request, res: Response): Promise<void> => {
    // await uploadServide.file(data)
    res.status(StatusCodes.OK).send({ status: 'OK' });
  };

  static audio = async (_req: Request, res: Response): Promise<void> => {
    // await uploadServide.audio(data)
    res.status(StatusCodes.OK).send({ status: 'OK' });
  };

}

export default UploadController;
