const{ createClient }=require('redis');
const redisclient = createClient({
  username: "default",
  password: process.env.REDIS_PASS,
  socket: {
    host: "redis-19901.c74.us-east-1-4.ec2.redns.redis-cloud.com",
    port: 19901,
  },
});
module.exports=redisclient;
