import Redis from 'ioredis';

// Create Redis client
const redis = new Redis({
  host: '127.0.0.1', // Change if Redis runs on a different server
  port: 6379,
  retryStrategy: (times) => Math.min(times * 50, 2000), // Auto-reconnect strategy
});

// Handle connection errors
redis.on('error', (err) => {
  console.error('❌ Redis Error:', err);
});

redis.on('connect', () => { console.log('✅ Redis Connected'); });

export default redis;
