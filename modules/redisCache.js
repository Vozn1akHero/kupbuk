const cacher = require('sequelize-redis-cache');

import redisClient from './redisClient';
import sequelize from './sequilize';

const cacheObj = cacher(sequelize, redisClient);

export default cacheObj;
