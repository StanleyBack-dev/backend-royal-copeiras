import { Inject, Injectable } from '@nestjs/common';
import { Redis } from '@upstash/redis';

@Injectable()
export class CacheGetProvider {
    constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) { }

    async execute<T>(key: string): Promise<T | null> {
        return await this.redis.get<T>(key);
    }
}