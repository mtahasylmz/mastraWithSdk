import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';


export const rateLimit = new Ratelimit({
    redis: new Redis({
        url: process.env.UPSTASH_REDIS_MEMORY_URL!,
        token: process.env.UPSTASH_REDIS_MEMORY_TOKEN!
    }),
    limiter: Ratelimit.slidingWindow(10, '10s'),
    prefix: 'upstash-ratelimit',
});






