const { createClient } = require('redis');

const redisclient = createClient({
  username: "default",
  password: process.env.REDIS_PASS,
  socket: {
    host: "redis-19901.c74.us-east-1-4.ec2.redns.redis-cloud.com",
    port: 19901,
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
  },
});

// Add error handling
redisclient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisclient.on('connect', () => {
  console.log('✅ Redis connected');
});

redisclient.on('ready', () => {
  console.log('✅ Redis ready');
});

module.exports = redisclient;
