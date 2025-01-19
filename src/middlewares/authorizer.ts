import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import config from '../config/';

export default (request: Request, response: Response, next: NextFunction): void => {
  const api_key = request.headers['api-key'] as string;

  if (!api_key || !config.api_keys.includes(api_key)) {
    response.status(StatusCodes.UNAUTHORIZED).send();
    return;
  }

  next();
};
