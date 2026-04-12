import { Inject, Injectable } from '@nestjs/common';
import { Redis } from '@upstash/redis';

@Injectable()
export class CacheSetProvider {
    constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) { }

    async execute<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        if (ttlSeconds) {
            await this.redis.set(key, value, { ex: ttlSeconds });
        } else {
            await this.redis.set(key, value);
        }
    }
}