import { redis, getOrSetCache } from './lib/redis';

// --- Simulation Helpers ---

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function slowDatabaseQuery() {
    console.log('   (🐢 Querying Database... this simulates a slow op)');
    await sleep(2000); // Simulate 2s delay
    return {
        id: 1,
        name: 'Cached Data Item',
        timestamp: new Date().toISOString(),
    };
}

// --- Main Demo ---

async function main() {
    console.log('🚀 Starting Redis Caching Demo...\n');
    const cacheKey = 'demo:slow-data';

    // Clear cache to start fresh
    await redis.del(cacheKey);

    // 1. First Call (Miss)
    console.log('--- 1. First Request (Cache Empty) ---');
    console.time('Request 1 Duration');

    const data1 = await getOrSetCache(cacheKey, slowDatabaseQuery);

    console.timeEnd('Request 1 Duration');
    console.log('Data:', data1);
    console.log('\n');

    // 2. Second Call (Hit)
    console.log('--- 2. Second Request (Cache Populated) ---');
    console.time('Request 2 Duration');

    const data2 = await getOrSetCache(cacheKey, slowDatabaseQuery);

    console.timeEnd('Request 2 Duration');
    console.log('Data:', data2);

    // Verification
    if (data1.timestamp === data2.timestamp) {
        console.log('✅ Success: Data returned from cache (timestamps match).');
    } else {
        console.error('❌ Error: Timestamps do not match!');
    }
    console.log('\n');

    // 3. Invalidation
    console.log('--- 3. Cache Invalidation ---');
    console.log('⚠️ Invalidating cache key...');
    await redis.del(cacheKey);

    console.log('Requesting again (Should be slow)...');
    console.time('Request 3 Duration');
    const data3 = await getOrSetCache(cacheKey, slowDatabaseQuery);
    console.timeEnd('Request 3 Duration');

    if (data3.timestamp !== data1.timestamp) {
        console.log('✅ Success: Cache refreshed with new data.');
    }

    // Cleanup
    redis.disconnect();
}

main().catch(console.error);
