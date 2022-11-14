var redis = require('redis');
var redisClient = redis.createClient();

redisClient.on('error', (err) => console.log('Redis Client Error', err));

module.exports = redisClient