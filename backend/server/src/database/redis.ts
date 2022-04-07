import { createClient } from 'redis';

import { redisPort, redisHost } from '../env';

export const redis = createClient({
    url: `redis://${redisHost}:${redisPort}`,
});
redis.connect();
