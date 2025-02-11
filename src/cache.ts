import redis from './redis';

export const cacheData = async (key: string, value: any, expiration = 60) => {
  await redis.set(key, JSON.stringify(value), 'EX', expiration);
};

export const getCachedData = async (key: string) => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};
