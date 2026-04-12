import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';
import { CacheGetProvider } from './providers/cache-get.provider';
import { CacheSetProvider } from './providers/cache-set.provider';
import { CacheDelProvider } from './providers/cache-del.provider';
import { CacheResetProvider } from './providers/cache-reset.provider';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'REDIS_CLIENT',
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const url = configService.get<string>('UPSTASH_REDIS_REST_URL');
                const token = configService.get<string>('UPSTASH_REDIS_REST_TOKEN');
                return new Redis({
                    url,
                    token,
                });
            },
        },
        CacheGetProvider,
        CacheSetProvider,
        CacheDelProvider,
        CacheResetProvider,
    ],
    exports: [
        'REDIS_CLIENT',
        CacheGetProvider,
        CacheSetProvider,
        CacheDelProvider,
        CacheResetProvider,
    ],
})

export class AppCacheModule { }