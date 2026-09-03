import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { isDeployedEnv } from "../../config/environment.util";

@Injectable()
export class RefreshTokenInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.getArgByIndex(2) as { res?: Record<string, unknown> };
    return next.handle().pipe(
      tap((data: unknown) => {
        const d = data as { refreshToken?: string };
        const res = ctx.res
          ? (ctx.res as unknown as import("express").Response)
          : undefined;
        if (d?.refreshToken && res) {
          res.cookie("refreshToken", d.refreshToken, {
            httpOnly: true,
            secure: isDeployedEnv(),
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000,
          });
        }
      }),
    );
  }
}
