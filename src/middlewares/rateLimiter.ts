import { Request, Response, NextFunction } from 'express';
import redis from '../redis';

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown';
  const key = `rate:${ip}`;
  const limit = 5; // Max 5 requests
  const ttl = 60; // Reset every 60 seconds

  const requests = await redis.incr(key);
  if (requests === 1) await redis.expire(key, ttl);

  if (requests > limit) {
    return res.status(429).json({ error: 'Too many requests. Try again later.' });
  }

  next();
};
