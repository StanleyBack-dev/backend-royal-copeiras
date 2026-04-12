import { Inject, Injectable } from '@nestjs/common';
import { Redis } from '@upstash/redis';

@Injectable()
export class CacheResetProvider {
    constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) { }

    async execute(): Promise<void> {
        await this.redis.flushall();
    }
}