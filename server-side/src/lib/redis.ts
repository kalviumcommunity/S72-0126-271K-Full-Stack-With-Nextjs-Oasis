import Redis from 'ioredis';

// Connect to Redis
const redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
});

redis.on('connect', () => {
    // console.log('🔌 Connected to Redis');
});

redis.on('error', (err) => {
    console.error('❌ Redis Error:', err);
});

/**
 * Cache-Aside Pattern Helper
 * 
 * @param key Cache Key
 * @param cb Callback function to fetch data if cache is missing
 * @param ttlSeconds Time to live in seconds (default: 60)
 */
export async function getOrSetCache<T>(
    key: string,
    cb: () => Promise<T>,
    ttlSeconds: number = 60
): Promise<T> {
    // 1. Try to get from cache
    const cachedData = await redis.get(key);

    if (cachedData) {
        // console.log(`⚡ Cache HIT for key: ${key}`);
        return JSON.parse(cachedData) as T;
    }

    // console.log(`🐢 Cache MISS for key: ${key}`);

    // 2. Fetch fresh data
    const freshData = await cb();

    // 3. Save to cache
    await redis.set(key, JSON.stringify(freshData), 'EX', ttlSeconds);

    return freshData;
}

export { redis };
