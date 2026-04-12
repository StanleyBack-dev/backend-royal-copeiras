import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RequestInfoInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    let req: any;

    if (context.getType() === 'http') {
      req = context.switchToHttp().getRequest();
    } else {
      const gqlCtx = GqlExecutionContext.create(context);
      req = gqlCtx.getContext().req;
    }

    if (!req) {
      return next.handle();
    }

    const ipAddress =
      (req.headers?.['x-forwarded-for'] as string)
        ?.split(',')[0]
        ?.trim() ||
      req.socket?.remoteAddress ||
      'Unknown';

    const userAgent = req.headers?.['user-agent'] || 'Unknown';

    req.requestInfo = {
      ipAddress,
      userAgent,
    };

    return next.handle();
  }
}