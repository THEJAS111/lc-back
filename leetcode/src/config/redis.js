const{ createClient }=require('redis');
const redisclient = createClient({
    username:"default",
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-17693.c98.us-east-1-4.ec2.cloud.redislabs.com',
        port: 17693
    }
});
module.exports=redisclient;
