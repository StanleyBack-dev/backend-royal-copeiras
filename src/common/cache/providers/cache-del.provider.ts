import { Injectable } from '@nestjs/common';
import { Redis } from '@upstash/redis';

@Injectable()
export class CacheDelProvider {
    private redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    async execute(prefix: string) {
        const keys = await this.redis.keys(`${prefix}*`);
        if (keys.length === 0) return;
        await this.redis.del(...keys);
    }
}