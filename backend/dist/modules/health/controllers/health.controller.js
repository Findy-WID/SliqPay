import { getRedis } from '../../../common/utils/redis.js';
export async function health(_req, res) {
    const ts = new Date().toISOString();
    let redis = 'down';
    try {
        const c = getRedis();
        const pong = await c.ping();
        if (typeof pong === 'string' && pong.toUpperCase() === 'PONG') {
            redis = 'up';
        }
    }
    catch {
        redis = 'down';
    }
    res.json({ status: 'ok', ts, services: { redis } });
}
export async function kvDemo(_req, res) {
    const c = getRedis();
    await c.set('foo', 'bar');
    const result = await c.get('foo');
    res.json({ key: 'foo', value: result });
}
