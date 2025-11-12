// /backend/src/queues/dubbingQueue.js
import Queue from 'bull';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const prefix = process.env.DUBBING_QUEUE_PREFIX || 'dubbing';

// simple connection options
const connection = redisUrl;

const dubbingQueue = new Queue('dubbing-jobs', {
  redis: connection,
  prefix,
});

export default dubbingQueue;
