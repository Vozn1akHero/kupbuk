require('dotenv').config();

var redis = require('redis');

var redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

redisClient.on('error', function(err) {
    console.log('Redis error: ' + err);
});

export default redisClient;
