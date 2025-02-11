// Redis Pub/Sub allows microservices to communicate efficiently.
import Redis from 'ioredis';

const pub = new Redis();
const sub = new Redis();

// Subscribe to a channel
sub.subscribe('notifications', (err, count) => {
  if (err) console.error('❌ Subscription error:', err);
  console.log(`📢 Subscribed to ${count} channel(s)`);
});

// Listen for messages
sub.on('message', (channel, message) => {
  console.log(`📩 Received on ${channel}:`, message);
});

// Function to publish messages
export const sendNotification = (message: string) => {
  pub.publish('notifications', message);
};
