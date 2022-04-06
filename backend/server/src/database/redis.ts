import { createClient } from 'redis';

export const redis = createClient({
    url: '0.0.0.0'
});
redis.connect();
