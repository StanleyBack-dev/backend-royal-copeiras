import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Redis } from '@upstash/redis';
import { rateLimitConfig } from '../../config/rate-limit.config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { TooManyRequestsException } from '../exceptions/too-many-requests.exception';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RateLimitGuard implements CanActivate {
    constructor(
        @Inject('REDIS_CLIENT') private readonly redis: Redis,
        private readonly reflector: Reflector,
        private readonly configService: ConfigService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const type = context.getType<'http' | 'graphql'>();

        let ip: string;
        let routeKey: string;
        let className: string;
        let userId: string | undefined;
        let req: any;

        if (type === 'http') {

            req = context.switchToHttp().getRequest();
            ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
            userId = req.user?.sub || req.user?.id;
            routeKey = req.route?.path || req.url;
            className = context.getClass().name.toLowerCase();

        } else if (type === 'graphql') {

            const gqlCtx = GqlExecutionContext.create(context);
            const ctx = gqlCtx.getContext();
            req = ctx.req;
            ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
            userId = req.user?.sub || req.user?.id;
            const info = gqlCtx.getInfo();
            routeKey = info.fieldName;
            className = gqlCtx.getClass().name.toLowerCase();
        } else {
            return true;
        }

        const config = rateLimitConfig(this.configService);
        const moduleKey = Object.keys(config).find((k) =>
            className.includes(k),
        );
        const { ttl, limit } = moduleKey ? config[moduleKey] : config.default;

        const identity = userId ? `user:${userId}` : `ip:${ip}`;
        const key = `ratelimit:${type}:${className}:${routeKey}:${identity}`;

        const current = await this.redis.get<number>(key);

        if (current && current >= limit) {
            throw new TooManyRequestsException();
        }

        if (current) {
            await this.redis.incr(key);
        } else {
            await this.redis.set(key, 1, { ex: ttl });
        }

        return true;
    }
}